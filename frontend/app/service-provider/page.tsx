import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Factory,
  FileText,
  Landmark,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import mesob from "@/app/mesob.jpg";

type ServiceProvider = {
  id: number;
  name: string;
};

type ServiceProviderPayload = {
  data?: ServiceProvider[];
};

const fallbackProviders: ServiceProvider[] = [
  "Mayor Office",
  "Municipality Office",
  "Finance Office",
  "Revenue Authority",
  "Land Management Office",
  "Trade & Industry Office",
  "Health Office",
  "Education Office",
  "Agriculture Office",
  "Women & Children Affairs Office",
  "Civil Service Office",
  "ICT Office",
  "Water & Sewerage Office",
  "Planning & Development Office",
  "Environmental Protection Office",
  "Peace & Security Office",
  "Court and Justice Offices",
  "Police Commission",
  "Fire & Emergency Office",
  "Culture & Tourism Office",
  "Youth & Sports Office",
  "Procurement & Property Administration Office",
  "Records & Archives Office",
  "Public Service & Human Resource Office",
].map((name, index) => ({ id: index + 1, name }));

function apiBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "http://127.0.0.1:8000/api"
  ).replace(/\/$/, "");
}

async function getServiceProviders(): Promise<ServiceProvider[]> {
  try {
    const response = await fetch(`${apiBaseUrl()}/public/service-providers`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      throw new Error("Unable to fetch service providers");
    }

    const payload = (await response.json()) as ServiceProviderPayload;
    return payload.data?.length ? payload.data : fallbackProviders;
  } catch {
    return fallbackProviders;
  }
}

const highlights = [
  "City-level and institution-level service ownership",
  "Clear responsibility for every citizen request",
  "Connected service delivery across offices",
  "Transparent digital workflow and reporting",
];

export default async function ServiceProviderPage() {
  const providers = await getServiceProviders();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="relative overflow-hidden bg-[#062f6f] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.35),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.45),transparent_28%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 md:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div>
            <Link href="/" className="mb-8 inline-flex items-center gap-3 rounded-full bg-white/10 px-4 py-2 text-sm font-bold backdrop-blur hover:bg-white/20">
              <Image src={mesob} alt="Adama MESOB" width={34} height={34} className="h-8 w-8 rounded-full object-cover" />
              Adama MESOB eService
            </Link>
            <p className="mb-4 inline-flex rounded-full bg-emerald-400/20 px-4 py-2 text-sm font-bold text-emerald-100">
              Government Offices • Digital Service Providers
            </p>
            <h1 className="max-w-4xl text-4xl font-black leading-tight md:text-6xl">
              Service providers delivering modern public services for Adama.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-blue-50">
              These offices are the official service owners inside Adama MESOB eService. Each provider can publish services,
              receive applications, assign responsible officers, review requests, and deliver public services through one
              transparent digital workflow.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/services" className="inline-flex items-center rounded-xl bg-emerald-500 px-6 py-3 font-black text-white shadow-xl hover:bg-emerald-600">
                View Digital Services <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link href="/about" className="inline-flex items-center rounded-xl bg-white px-6 py-3 font-black text-[#062f6f] shadow-xl hover:bg-slate-100">
                About MESOB
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/20 bg-white/10 p-5 shadow-2xl backdrop-blur">
            <div className="rounded-[1.5rem] bg-white p-5 text-slate-900">
              <div className="grid grid-cols-2 gap-4">
                <StatCard icon={Landmark} value="1" label="City Administration" />
                <StatCard icon={Building2} value={`${providers.length}+`} label="Service Providers" />
                <StatCard icon={Users} value="All" label="Citizens & Businesses" />
                <StatCard icon={ShieldCheck} value="24/7" label="Digital Access" />
              </div>
              <div className="mt-5 rounded-2xl bg-gradient-to-r from-[#063d91] to-emerald-600 p-5 text-white">
                <p className="text-sm font-bold uppercase tracking-wider text-blue-100">Service Ownership</p>
                <h2 className="mt-2 text-2xl font-black">Every request is routed to the correct responsible office.</h2>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 md:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <InfoCard icon={Factory} title="Official Providers" text="Each office represents an authorized government institution responsible for specific public services." />
          <InfoCard icon={ClipboardCheck} title="Digital Workflow" text="Applications move from submission to verification, review, approval, payment, and final delivery." />
          <InfoCard icon={Sparkles} title="Better Governance" text="MESOB improves accountability, visibility, reporting, and citizen satisfaction across service offices." />
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <SectionTitle eyebrow="Provider Directory" title="Government offices connected to Adama MESOB eService" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {providers.map((provider, index) => (
              <div key={provider.id} className="group rounded-3xl border bg-slate-50 p-6 shadow-sm transition hover:-translate-y-1 hover:bg-white hover:shadow-xl">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 transition group-hover:bg-[#063d91] group-hover:text-white">
                    <Building2 className="h-7 w-7" />
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-500 shadow-sm">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="text-lg font-black leading-7 text-[#063d91]">{provider.name}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Provides digital public services, manages applications, and supports citizens through MESOB workflow.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#08214a] py-16 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 md:px-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-black uppercase tracking-widest text-emerald-400">Why providers matter</p>
            <h2 className="mt-3 text-3xl font-black md:text-4xl">One platform. Many responsible offices.</h2>
            <p className="mt-5 leading-8 text-blue-50">
              Service providers make the system practical by linking each digital service to the office that owns the work,
              the officers who process it, and the citizens who need the result.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {highlights.map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-emerald-400" />
                <span className="font-bold leading-7">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <div className="grid gap-8 rounded-[2rem] bg-white p-6 shadow-xl md:p-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <p className="text-sm font-black uppercase tracking-widest text-emerald-600">Adama MESOB Service Center</p>
            <h2 className="mt-3 text-3xl font-black text-[#063d91] md:text-4xl">A coordinated provider network for faster public service delivery.</h2>
            <p className="mt-5 leading-8 text-slate-600">
              By organizing service providers in one digital directory, MESOB helps citizens identify the correct office,
              submit the correct request, and track progress without unnecessary movement between institutions.
            </p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-6 shadow-sm">
            <FileText className="h-10 w-10 text-emerald-600" />
            <h3 className="mt-4 text-xl font-black text-[#063d91]">Need Support?</h3>
            <p className="mt-3 flex gap-3 text-sm text-slate-600"><MapPin className="h-5 w-5" />Adama, Oromia, Ethiopia</p>
            <p className="mt-3 flex gap-3 text-sm text-slate-600"><Phone className="h-5 w-5" />+251 9141</p>
            <p className="mt-3 flex gap-3 text-sm text-slate-600"><Mail className="h-5 w-5" />temamaman156@gmail.com</p>
          </div>
        </div>
      </section>
    </main>
  );
}

function StatCard({ icon: Icon, value, label }: { icon: typeof Building2; value: string; label: string }) {
  return (
    <div className="rounded-2xl border bg-slate-50 p-5 shadow-sm">
      <Icon className="mb-4 h-8 w-8 text-emerald-600" />
      <div className="text-4xl font-black text-[#063d91]">{value}</div>
      <p className="mt-1 text-sm font-bold text-slate-600">{label}</p>
    </div>
  );
}

function InfoCard({ icon: Icon, title, text }: { icon: typeof Building2; title: string; text: string }) {
  return (
    <div className="rounded-3xl border bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100">
        <Icon className="h-8 w-8 text-emerald-700" />
      </div>
      <h2 className="text-2xl font-black text-[#063d91]">{title}</h2>
      <p className="mt-4 leading-7 text-slate-600">{text}</p>
    </div>
  );
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-10 max-w-3xl">
      <p className="text-sm font-black uppercase tracking-widest text-emerald-600">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-black text-[#063d91] md:text-4xl">{title}</h2>
    </div>
  );
}
