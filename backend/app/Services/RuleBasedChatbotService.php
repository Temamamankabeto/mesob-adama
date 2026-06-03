<?php

namespace App\Services;

use App\Models\ChatbotConversation;
use App\Models\City;
use App\Models\Service;
use App\Models\ServiceApplication;
use App\Models\Subcity;
use App\Models\User;
use App\Models\Woreda;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class RuleBasedChatbotService
{
    public function reply(?User $user, string $message, ?string $sessionId = null, string $source = 'web'): array
    {
        $message = trim($message);
        $language = $this->detectLanguage($message);
        $normalized = $this->normalize($message);
        $tracking = $this->extractTrackingNumber($message);
        $context = $this->lastContext($sessionId, $user);

        if ($this->isCustomerLike($user) && $this->isBlockedCustomerQuestion($normalized)) {
            return $this->respond($user, 'blocked_internal_info', $language, $this->blockedCustomerAnswer($language), $sessionId, $source, $message, ['blocked' => true]);
        }

        $flow = $this->continueFlow($user, $message, $normalized, $language, $context);
        if ($flow) {
            return $this->respond($user, $flow['intent'], $language, $flow['reply'], $sessionId, $source, $message, $flow['context'] ?? null, $flow['suggestions'] ?? null);
        }

        $intent = $this->detectIntent($normalized, $tracking);

        $result = match ($intent) {
            'greeting' => $this->greeting($language),
            'services_list' => $this->servicesList($language),
            'service_detail' => $this->serviceDetail($message, $language),
            'service_criteria' => $this->serviceCriteria($message, $language),
            'apply_steps' => $this->startApplyFlow($message, $language, 'apply'),
            'application_tracking' => $this->trackApplication($user, $tracking, $message, $language),
            'appointment' => $this->appointment($user, $tracking, $message, $language),
            'payment' => $this->payment($user, $tracking, $message, $language),
            'documents' => $this->documents($user, $tracking, $message, $language),
            'rejection_return' => $this->resubmitOrRejection($user, $tracking, $message, $language),
            'auth_help' => $this->authHelp($language),
            'profile_account' => $this->profileHelp($language),
            'officer_queue_report', 'manager_report', 'admin_report', 'super_admin_report', 'report_questions' => $this->reportHelp($user, $intent, $language),
            default => ['reply' => $this->fallback($language)],
        };

        return $this->respond($user, $intent, $language, $result['reply'], $sessionId, $source, $message, $result['context'] ?? null, $result['suggestions'] ?? null);
    }

    private function normalize(string $message): string
    {
        $value = Str::lower($message);
        $value = preg_replace('/[^\p{L}\p{N}\s\-]/u', ' ', $value) ?: $value;
        return trim(preg_replace('/\s+/', ' ', $value) ?: $value);
    }

    private function detectLanguage(string $message): string
    {
        if (preg_match('/[\x{1200}-\x{137F}]/u', $message)) return 'am';
        foreach (['akkam', 'maal', 'eessa', 'tajaajila', 'iyyata', 'kaffaltii', 'beellama', 'ulaagaa', 'gabaasa'] as $word) {
            if (str_contains(Str::lower($message), $word)) return 'om';
        }
        return 'en';
    }

    private function detectIntent(string $normalized, ?string $tracking): string
    {
        if ($tracking) return 'application_tracking';
        $scores = [];
        foreach (config('chatbot_rules.intents', []) as $intent => $keywords) {
            $scores[$intent] = 0;
            foreach ($keywords as $keyword) {
                $keyword = Str::lower($keyword);
                if (str_contains($normalized, $keyword)) $scores[$intent] += 100 + mb_strlen($keyword);
            }
        }
        arsort($scores);
        return (($scores[array_key_first($scores)] ?? 0) > 0) ? array_key_first($scores) : 'fallback';
    }

    private function continueFlow(?User $user, string $message, string $normalized, string $language, ?array $context): ?array
    {
        if (!$context || empty($context['flow'])) return null;

        if ($this->detectIntent($normalized, null) === 'services_list') {
            $list = $this->servicesList($language);
            $list['context'] = $context;
            $list['intent'] = 'services_list';
            return $list;
        }

        if ($context['flow'] === 'apply_select_service') {
            $service = $this->findServiceInMessage($message);
            if (!$service) {
                return [
                    'intent' => 'apply_steps',
                    'reply' => $this->text($language, 'Please write the service name you want to apply for. You can also ask: list services.', "Maqaa tajaajila iyyachuu barbaaddu barreessi. Akkasumas 'tajaajiloota tarreessi' jettee gaafachuu dandeessa.", 'እባክዎ ለማመልከት የሚፈልጉትን የአገልግሎት ስም ይፃፉ። እንዲሁም "አገልግሎቶችን ዘርዝር" ማለት ይችላሉ።'),
                    'context' => $context,
                    'suggestions' => ['List services', 'Service criteria'],
                ];
            }
            return ['intent' => 'apply_steps', ...$this->askLevelForService($service, $language)];
        }

        if ($context['flow'] === 'apply_select_level' && !empty($context['service_id'])) {
            $service = Service::find((int) $context['service_id']);
            $level = $this->extractLevel($normalized);
            if (!$service || !$level) {
                return [
                    'intent' => 'apply_steps',
                    'reply' => $this->text($language, 'Please choose one level: city, subcity, or woreda.', 'Sadarkaa tokko fili: city, subcity, yookaan woreda.', 'እባክዎ አንድ ደረጃ ይምረጡ፦ city, subcity, ወይም woreda።'),
                    'context' => $context,
                    'suggestions' => ['city', 'subcity', 'woreda'],
                ];
            }
            return ['intent' => 'apply_steps', ...$this->handleLevelSelection($service, $level, $language)];
        }

        if ($context['flow'] === 'apply_select_subcity') {
            $service = Service::find((int) $context['service_id']);
            $subcity = $this->findSubcityInMessage($message);
            if (!$service || !$subcity) {
                return ['intent' => 'apply_steps', 'reply' => $this->text($language, 'Please select a valid subcity from the list.', 'Subcity sirrii tarree keessaa fili.', 'እባክዎ ከዝርዝሩ ትክክለኛ ክፍለ ከተማ ይምረጡ።'), 'context' => $context];
            }
            if (($context['level'] ?? '') === 'subcity') {
                return ['intent' => 'apply_steps', ...$this->formLink($service, 'subcity', $language, ['city_id' => $subcity->city_id, 'subcity_id' => $subcity->id])];
            }
            $woredas = Woreda::where('subcity_id', $subcity->id)->orderBy('name')->get();
            return [
                'intent' => 'apply_steps',
                'reply' => $this->text($language, "Please select your woreda:\n" . $this->numbered($woredas), "Woreda kee fili:\n" . $this->numbered($woredas), "እባክዎ ወረዳዎን ይምረጡ፦\n" . $this->numbered($woredas)),
                'context' => ['flow' => 'apply_select_woreda', 'service_id' => $service->id, 'level' => 'woreda', 'city_id' => $subcity->city_id, 'subcity_id' => $subcity->id],
            ];
        }

        if ($context['flow'] === 'apply_select_woreda') {
            $service = Service::find((int) $context['service_id']);
            $woreda = $this->findWoredaInMessage($message, (int) $context['subcity_id']);
            if (!$service || !$woreda) return ['intent' => 'apply_steps', 'reply' => $this->text($language, 'Please select a valid woreda from the list.', 'Woreda sirrii tarree keessaa fili.', 'እባክዎ ከዝርዝሩ ትክክለኛ ወረዳ ይምረጡ።'), 'context' => $context];
            return ['intent' => 'apply_steps', ...$this->formLink($service, 'woreda', $language, ['city_id' => $context['city_id'], 'subcity_id' => $context['subcity_id'], 'woreda_id' => $woreda->id])];
        }

        return null;
    }

    private function greeting(string $language): array
    {
        return ['reply' => $this->text($language, 'Hello! I am MESOB eService Assistant. I can help with services, reports, applications, appointments, payments, and workflow guidance.', "Akkam! Ani MESOB eService Assistant dha. Tajaajila, gabaasa, iyyata, beellama, kaffaltii fi adeemsa hojii irratti si gargaaruu nan danda'a.", 'ሰላም! እኔ የMESOB eService ረዳት ነኝ። ስለ አገልግሎቶች፣ ሪፖርቶች፣ ማመልከቻዎች፣ ቀጠሮ፣ ክፍያ እና workflow ልረዳዎት እችላለሁ።')];
    }

    private function servicesList(string $language): array
    {
        $services = Service::where('status', 'active')->orderBy('name')->limit(15)->get(['id', 'name']);
        $list = $services->map(fn ($s, $i) => ($i + 1) . '. ' . $s->name)->implode("\n") ?: '-';
        return ['reply' => $this->text($language, "Available MESOB services:\n{$list}\n\nWrite the service name to continue.", "Tajaajiloota MESOB jiran:\n{$list}\n\nItti fufuuf maqaa tajaajilaa barreessi.", "የMESOB አገልግሎቶች:\n{$list}\n\nለመቀጠል የአገልግሎቱን ስም ይፃፉ።"), 'suggestions' => $services->take(4)->pluck('name')->values()->all()];
    }

    private function serviceDetail(string $message, string $language): array
    {
        $service = $this->findServiceInMessage($message);
        if (!$service) return ['reply' => $this->text($language, 'Please mention the service name.', 'Maqaa tajaajilaa barreessi.', 'እባክዎ የአገልግሎቱን ስም ይጥቀሱ።')];
        $fee = Number_format((float) ($service->service_fee ?? 0), 2);
        return ['reply' => "Service: {$service->name}\nDescription: " . ($service->description ?: '-') . "\nFee: {$fee} ETB\nBack officer review: " . ($service->has_back_officer ? 'Required' : 'Not required')];
    }

    private function serviceCriteria(string $message, string $language): array
    {
        $service = $this->findServiceInMessage($message);
        if (!$service) return ['reply' => $this->text($language, 'Which service criteria do you want to know? Please mention the service name.', 'Ulaagaa tajaajila kami beekuu barbaadda? Maqaa tajaajilaa barreessi.', 'የየትኛውን አገልግሎት መስፈርት ማወቅ ይፈልጋሉ? የአገልግሎቱን ስም ይጥቀሱ።')];
        $service->load(['criteria' => fn ($q) => $q->where('is_active', true)->orderBy('sort_order')]);
        $items = $service->criteria->flatMap(fn ($c) => $c->criteria_items ?: preg_split('/\r\n|\r|\n/', (string) $c->criteria))->map(fn ($item) => trim((string) $item))->filter()->values();
        if ($items->isEmpty()) return ['reply' => $this->text($language, "No criteria are configured yet for {$service->name}.", "{$service->name} irratti ulaagaan hin galmoofne.", "ለ{$service->name} መስፈርት አልተመዘገበም።")];
        $list = $items->map(fn ($item, $i) => ($i + 1) . '. ' . $item)->implode("\n");
        return ['reply' => $this->text($language, "Criteria for {$service->name}:\n{$list}", "{$service->name}f ulaagaalee:\n{$list}", "የ{$service->name} መስፈርቶች:\n{$list}")];
    }

    private function startApplyFlow(string $message, string $language, string $source): array
    {
        $service = $this->findServiceInMessage($message);
        if (!$service) return ['reply' => $this->text($language, "To apply: login/register, search service, read criteria, select level/location, fill form, upload files, submit, and save tracking number.\n\nWhich service do you want to apply for?", "Iyyachuuf: login/galmaa'i, tajaajila barbaadi, ulaagaa dubbisi, sadarkaa fi bakka fili, formii guuti, faayilii fe'i, galchi, lakkoofsa hordoffii olkaa'i.\n\nTajaajila kamiif iyyachuu barbaadda?", "ለማመልከት፦ ይግቡ/ይመዝገቡ፣ አገልግሎት ይፈልጉ፣ መስፈርት ያንብቡ፣ ደረጃ/ቦታ ይምረጡ፣ ቅጽ ይሙሉ፣ ፋይል ይጫኑ፣ ያስገቡ፣ መከታተያ ቁጥር ያስቀምጡ።\n\nለየትኛው አገልግሎት ማመልከት ይፈልጋሉ?"), 'context' => ['flow' => 'apply_select_service', 'source' => $source], 'suggestions' => ['List services', 'Service criteria']];
        return $this->askLevelForService($service, $language);
    }

    private function askLevelForService(Service $service, string $language): array
    {
        $levels = $this->serviceLevels($service);
        $label = implode(', ', $levels);
        return ['reply' => $this->text($language, "This service is available at: {$label}.\nWhich level do you want?", "Tajaajilli kun sadarkaalee kanneen irratti ni argama: {$label}.\nSadarkaa kami barbaadda?", "ይህ አገልግሎት በእነዚህ ደረጃዎች ይገኛል፦ {$label}።\nየትኛውን ደረጃ ይፈልጋሉ?"), 'context' => ['flow' => 'apply_select_level', 'service_id' => $service->id], 'suggestions' => $levels];
    }

    private function handleLevelSelection(Service $service, string $level, string $language): array
    {
        if (!in_array($level, $this->serviceLevels($service), true)) return ['reply' => $this->text($language, 'This service is not available at the selected level.', 'Tajaajilli kun sadarkaa filatame irratti hin argamu.', 'ይህ አገልግሎት በተመረጠው ደረጃ አይገኝም።'), 'context' => ['flow' => 'apply_select_level', 'service_id' => $service->id]];
        if ($level === 'city') return $this->formLink($service, 'city', $language, ['city_id' => City::orderBy('id')->value('id')]);
        $subcities = Subcity::orderBy('name')->get();
        return ['reply' => $this->text($language, "Please select your subcity:\n" . $this->numbered($subcities), "Subcity kee fili:\n" . $this->numbered($subcities), "እባክዎ ክፍለ ከተማዎን ይምረጡ፦\n" . $this->numbered($subcities)), 'context' => ['flow' => 'apply_select_subcity', 'service_id' => $service->id, 'level' => $level]];
    }

    private function formLink(Service $service, string $level, string $language, array $params): array
    {
        $query = http_build_query(array_filter(['administrative_level' => $level, 'city_id' => $params['city_id'] ?? null, 'subcity_id' => $params['subcity_id'] ?? null, 'woreda_id' => $params['woreda_id'] ?? null]));
        $link = "/services/{$service->id}/apply?{$query}";
        return ['reply' => $this->text($language, "Open this form link and submit your application:\n{$link}\n\nAfter submission, you will receive a tracking number.", "Linkii formii kana baniitii iyyata kee galchi:\n{$link}\n\nErga galchite booda lakkoofsa hordoffii ni argatta.", "ይህን የቅጽ ሊንክ ይክፈቱ እና ማመልከቻዎን ያስገቡ፦\n{$link}\n\nካስገቡ በኋላ መከታተያ ቁጥር ያገኛሉ።"), 'context' => ['flow' => 'apply_link_ready', 'link' => $link], 'suggestions' => ['Service criteria', 'How to track after submit']];
    }

    private function trackApplication(?User $user, ?string $tracking, string $message, string $language): array
    {
        $app = $this->findApplication($user, $tracking, $message);
        if (!$app) return ['reply' => $this->text($language, 'Application not found. Please provide a valid tracking number.', 'Iyyanni hin argamne. Lakkoofsa hordoffii sirrii galchi.', 'ማመልከቻው አልተገኘም። ትክክለኛ መከታተያ ቁጥር ያስገቡ።')];
        $appt = $app->appointments->first();
        $extra = $appt ? "\nAppointment: " . optional($appt->appointment_at)->format('Y-m-d H:i') . ($appt->location ? " at {$appt->location}" : '') : '';
        $reason = $app->rejection_reason ? "\nReason: {$app->rejection_reason}" : '';
        return ['reply' => "Application {$app->tracking_number}\nService: {$app->service?->name}\nStatus: {$this->statusLabel($app->status)}{$extra}{$reason}"];
    }

    private function appointment(?User $user, ?string $tracking, string $message, string $language): array
    {
        $app = $this->findApplication($user, $tracking, $message);
        if (!$app) return ['reply' => $this->text($language, 'Please provide your tracking number or login to check appointment.', 'Beellama ilaaluuf lakkoofsa hordoffii galchi ykn login godhi.', 'ቀጠሮ ለማየት መከታተያ ቁጥር ያስገቡ ወይም ይግቡ።')];
        $appointment = $app->appointments()->latest('appointment_at')->first();
        if (!$appointment) return ['reply' => $this->text($language, 'No appointment is scheduled for this application yet.', 'Iyyata kanaaf beellamni hin qabamne.', 'ለዚህ ማመልከቻ ቀጠሮ አልተያዘም።')];
        return ['reply' => "Appointment: {$appointment->appointment_at->format('Y-m-d H:i')}\nLocation: " . ($appointment->location ?: '-') . "\nMessage: " . ($appointment->message ?: '-')];
    }

    private function payment(?User $user, ?string $tracking, string $message, string $language): array
    {
        $app = $this->findApplication($user, $tracking, $message);
        if (!$app) return ['reply' => $this->text($language, 'Please provide tracking number or login to check payment.', 'Kaffaltii ilaaluuf lakkoofsa hordoffii galchi ykn login godhi.', 'ክፍያ ለማየት መከታተያ ቁጥር ያስገቡ ወይም ይግቡ።')];
        if (!Schema::hasTable('payments')) return ['reply' => "Payment module is not enabled. Service fee: " . ($app->service?->service_fee ?? 0) . " ETB."];
        $columns = Schema::getColumnListing('payments');
        $appCol = collect(['service_application_id', 'application_id'])->first(fn ($c) => in_array($c, $columns, true));
        if (!$appCol) return ['reply' => 'Payment records are not linked to applications yet.'];
        $payment = DB::table('payments')->where($appCol, $app->id)->latest('id')->first();
        return ['reply' => $payment ? "Payment status: " . ($payment->status ?? 'pending') : 'No payment record found for this application.'];
    }

    private function documents(?User $user, ?string $tracking, string $message, string $language): array
    {
        $app = $this->findApplication($user, $tracking, $message);
        if (!$app) return ['reply' => 'Please provide tracking number or login to see document summary.'];
        $count = $app->files()->count();
        return ['reply' => "This application has {$count} uploaded file(s). Open the application detail page to download allowed documents."];
    }

    private function resubmitOrRejection(?User $user, ?string $tracking, string $message, string $language): array
    {
        $app = $this->findApplication($user, $tracking, $message);
        if (!$app) return $this->startApplyFlow($message, $language, 'resubmit');
        $reason = $app->rejection_reason ?: $app->histories()->whereIn('to_status', ['rejected', 'returned_to_customer', 'back_officer_rejected'])->latest()->value('remark');
        return ['reply' => $reason ? "Reason: {$reason}\nTo resubmit, open your application detail, update requested information/files, then click Resubmit." : 'To resubmit, open your returned/rejected application detail, correct the requested information/files, then click Resubmit.'];
    }

    private function authHelp(string $language): array
    {
        return ['reply' => 'Register at /register or login at /login. If your account is disabled or pending activation, contact the responsible office/admin.'];
    }

    private function profileHelp(string $language): array
    {
        return ['reply' => 'Open Dashboard → Profile to update profile information or change password. Some fields may be read-only depending on your account type.'];
    }

    private function reportHelp(?User $user, string $intent, string $language): array
    {
        $role = $this->roleName($user);
        $scope = $this->scopeName($user);

        if (!$user) return ['reply' => 'Public users can ask only public service summaries, such as available services by level. Internal reports require login.'];

        if ($this->isCustomerLike($user)) {
            $total = ServiceApplication::where('customer_id', $user->id)->count();
            $pending = ServiceApplication::where('customer_id', $user->id)->whereIn('status', ['submitted', 'accepted', 'under_review', 'appointment_scheduled'])->count();
            $approved = ServiceApplication::where('customer_id', $user->id)->whereIn('status', ['approved', 'completed'])->count();
            $rejected = ServiceApplication::where('customer_id', $user->id)->whereIn('status', ['rejected', 'returned_to_customer'])->count();
            return ['reply' => "Your application summary:\nTotal: {$total}\nPending/In progress: {$pending}\nApproved/Completed: {$approved}\nReturned/Rejected: {$rejected}"];
        }

        return ['reply' => "Report help for role: {$role}, scope: {$scope}.\nYou can ask for application report, user report, service report, officer report, appointment report, payment report, SLA report, activation request report, workload, bottleneck, or performance summary. Detailed records must be viewed from the related dashboard module."];
    }

    private function findServiceInMessage(string $message): ?Service
    {
        $normalized = $this->normalize($message);
        if ($this->detectIntent($normalized, null) === 'services_list') return null;
        return Service::where('status', 'active')->with('criteria')->get()->first(function ($service) use ($normalized) {
            $name = Str::lower($service->name);
            if (str_contains($normalized, $name)) return true;
            $words = collect(explode(' ', $name))->filter(fn ($w) => mb_strlen($w) > 2);
            return $words->count() >= 2 ? $words->filter(fn ($w) => str_contains($normalized, $w))->count() >= 2 : $words->contains(fn ($w) => str_contains($normalized, $w));
        });
    }

    private function findApplication(?User $user, ?string $tracking, string $message): ?ServiceApplication
    {
        $query = ServiceApplication::with(['service', 'appointments', 'histories']);
        if ($user && $this->isCustomerLike($user)) $query->where('customer_id', $user->id);
        if ($tracking) return $query->where(fn ($q) => $q->where('tracking_number', $tracking)->orWhere('id', $tracking))->latest('updated_at')->first();
        if ($user && str_contains($this->normalize($message), 'my')) return $query->latest('updated_at')->first();
        return null;
    }

    private function extractTrackingNumber(string $message): ?string
    {
        if (preg_match('/\b[A-Z]{2,10}-\d{4}-[A-Z0-9-]+\b/i', $message, $m)) return strtoupper($m[0]);
        return null;
    }

    private function extractLevel(string $message): ?string
    {
        foreach (['woreda', 'subcity', 'city'] as $level) if (str_contains($message, $level)) return $level;
        if (str_contains($message, 'ወረዳ')) return 'woreda';
        if (str_contains($message, 'ክፍለ')) return 'subcity';
        if (str_contains($message, 'ከተማ')) return 'city';
        return null;
    }

    private function serviceLevels(Service $service): array
    {
        $availability = $service->availability;
        if (is_string($availability)) $availability = json_decode($availability, true) ?: [];
        if (is_array($availability)) {
            if (array_is_list($availability)) return array_values(array_intersect(['city', 'subcity', 'woreda'], $availability));
            if (isset($availability['levels'])) return array_values(array_intersect(['city', 'subcity', 'woreda'], (array) $availability['levels']));
            if (isset($availability['administrative_levels'])) return array_values(array_intersect(['city', 'subcity', 'woreda'], (array) $availability['administrative_levels']));
            $levels = collect(['city', 'subcity', 'woreda'])->filter(fn ($l) => ($availability[$l] ?? false) === true)->values()->all();
            return $levels ?: ['city'];
        }
        return ['city'];
    }

    private function findSubcityInMessage(string $message): ?Subcity
    {
        $n = $this->normalize($message);
        return Subcity::orderBy('name')->get()->first(fn ($s) => str_contains($n, Str::lower($s->name)) || str_contains($n, (string) $s->id));
    }

    private function findWoredaInMessage(string $message, int $subcityId): ?Woreda
    {
        $n = $this->normalize($message);
        return Woreda::where('subcity_id', $subcityId)->orderBy('name')->get()->first(fn ($w) => str_contains($n, Str::lower($w->name)) || str_contains($n, (string) $w->id));
    }

    private function numbered(Collection $items): string
    {
        return $items->isEmpty() ? '-' : $items->map(fn ($i, $idx) => ($idx + 1) . '. ' . $i->name)->implode("\n");
    }

    private function isBlockedCustomerQuestion(string $normalized): bool
    {
        foreach (config('chatbot_rules.blocked_customer_keywords', []) as $kw) if (str_contains($normalized, Str::lower($kw))) return true;
        return false;
    }

    private function isCustomerLike(?User $user): bool
    {
        if (!$user) return true;
        $role = $this->roleName($user);
        return str_contains($role, 'customer') || str_contains($role, 'citizen');
    }

    private function roleName(?User $user): string
    {
        if (!$user) return 'public';
        if (method_exists($user, 'getRoleNames')) return Str::lower((string) ($user->getRoleNames()->first() ?: $user->role ?: 'user'));
        return Str::lower((string) ($user->role ?: 'user'));
    }

    private function scopeName(?User $user): string
    {
        if (!$user) return 'public';
        if ($user->woreda_id) return 'woreda';
        if ($user->subcity_id) return 'subcity';
        if ($user->city_id) return 'city';
        return 'system';
    }

    private function blockedCustomerAnswer(string $language): string
    {
        return $this->text($language, 'This is internal office information and cannot be shared with customers. I can help you with available services, service criteria, how to apply, tracking, appointment, payment, and returned application guidance.', 'Kun odeeffannoo keessaa waajjiraa waan ta’eef maamiltootaaf hin qoodamu. Tajaajiloota, ulaagaa, akka iyyatan, hordoffii, beellama, kaffaltii fi gorsa iyyata deebi’e irratti si gargaaruu nan danda’a.', 'ይህ የውስጥ የቢሮ መረጃ ስለሆነ ለደንበኞች አይጋራም። እኔ ስለ አገልግሎቶች፣ መስፈርቶች፣ ማመልከት፣ ክትትል፣ ቀጠሮ፣ ክፍያ እና የተመለሰ ማመልከቻ መመሪያ ልረዳዎት እችላለሁ።');
    }

    private function fallback(string $language): string
    {
        return match ($language) {
            'om' => "Dhiifama, gaaffii kee sirriitti hin hubanne. Ani tajaajiloota, ulaagaalee, akka iyyatan, hordoffii, beellama, kaffaltii, sababaa deebii/diddaa, irra deebiin galchuu, gabaasa, fayyadamtoota, hojjettoota, foddaa fi ramaddii irratti akka role keetitti si gargaaruu nan danda'a.",
            'am' => 'ይቅርታ፣ ጥያቄዎን በትክክል አልተረዳሁም። ስለ አገልግሎቶች፣ መስፈርቶች፣ ማመልከት፣ ክትትል፣ ቀጠሮ፣ ክፍያ፣ መመለሻ/ውድቅ ምክንያት፣ እንደገና ማስገባት፣ ሪፖርቶች፣ ተጠቃሚዎች፣ ኦፊሰሮች፣ መስኮቶች እና ምደባዎች በሚናዎ መሰረት ልረዳዎት እችላለሁ።',
            default => 'I could not understand your question clearly. I can help with services, criteria, how to apply, tracking, appointment, payment, returned/rejected reason, resubmission, reports, users, officers, windows, and assignments based on your role. Please ask with a service name, tracking number, officer name, window name, or location.',
        };
    }

    private function suggestions(string $language): array
    {
        return match ($language) {
            'om' => ['Tajaajiloota tarreessi', 'Ulaagaa tajaajilaa', 'Iyyata akkamitti galchuu?', 'Gabaasa koo'],
            'am' => ['አገልግሎቶችን ዘርዝር', 'የአገልግሎት መስፈርት', 'እንዴት ማመልከት?', 'የእኔ ሪፖርት'],
            default => ['List services', 'Service criteria', 'How to apply?', 'Show my report'],
        };
    }

    private function lastContext(?string $sessionId, ?User $user): ?array
    {
        if (!$sessionId || !Schema::hasTable('chatbot_conversations')) return null;
        $q = ChatbotConversation::where('session_id', $sessionId)->whereNotNull('source_context');
        if ($user) $q->where(fn ($x) => $x->whereNull('user_id')->orWhere('user_id', $user->id));
        return $q->latest()->value('source_context');
    }

    private function respond(?User $user, string $intent, string $language, string $reply, ?string $sessionId, string $source, string $question, ?array $context = null, ?array $suggestions = null): array
    {
        if (Schema::hasTable('chatbot_conversations')) {
            ChatbotConversation::create([
                'user_id' => $user?->id,
                'session_id' => $sessionId,
                'source' => $source,
                'intent' => $intent,
                'role' => $this->roleName($user),
                'scope' => $this->scopeName($user),
                'language' => $language,
                'question' => $question,
                'answer' => $reply,
                'source_context' => $context ? array_merge($context, ['intent' => $intent]) : null,
            ]);
        }
        return ['reply' => $reply, 'intent' => $intent, 'role' => $this->roleName($user), 'scope' => $this->scopeName($user), 'language' => $language, 'suggestions' => $suggestions ?? $this->suggestions($language), 'context' => $context];
    }

    private function statusLabel(?string $status): string
    {
        return Str::of($status ?: '-')->replace('_', ' ')->title()->toString();
    }

    private function text(string $language, string $en, string $om, string $am): string
    {
        return match ($language) {'om' => $om, 'am' => $am, default => $en};
    }
}
