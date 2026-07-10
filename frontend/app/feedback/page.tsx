"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    useWindows,
    useWindowServices,
    useCreateFeedback,
} from "@/hooks/use-feedback";
import type { FeedbackPayload } from "@/types/feedback";
import { toast } from "sonner";
import {
    Loader2,
    Heart,
    ChevronRight,
    Building,
    Star,
    Users,
    CheckCircle2,
    ArrowLeft,
} from "lucide-react";

/* ==========================================================
| Validation Schema
========================================================== */

const feedbackSchema = z.object({
    window_id: z.number({
        required_error: "Please select a window.",
    }),
    service_id: z.number({
        required_error: "Please select a service.",
    }),
    overall_rating: z.number().min(1).max(5),
    staff_behavior: z.number().min(1).max(5),
    waiting_time: z.number().min(1).max(5),
    service_quality: z.number().min(1).max(5),
    cleanliness: z.number().min(1).max(5),
    satisfaction: z.enum(["highly_satisfied", "satisfied", "not_satisfied"]),
    comment: z.string().optional(),
    gender: z.enum(["male", "female"]).optional(),
    age: z.number().min(1).max(120).optional().nullable(),
});

type FeedbackFormValues = z.infer<typeof feedbackSchema>;

/* ==========================================================
| Service Selection Popup
========================================================== */

interface ServicePopupProps {
    isOpen: boolean;
    onClose: () => void;
    window: any;
    services: any[];
    onSelectService: (serviceId: number) => void;
    isLoading: boolean;
    windowName?: string;
}

function ServicePopup({
                          isOpen,
                          onClose,
                          window,
                          services,
                          onSelectService,
                          isLoading,
                          windowName,
                      }: ServicePopupProps) {
    const [selectedService, setSelectedService] = useState<number | null>(null);
    const [showFeedbackForm, setShowFeedbackForm] = useState(false);
    const [selectedServiceName, setSelectedServiceName] = useState("");

    const handleServiceClick = (serviceId: number, serviceName: string) => {
        setSelectedService(serviceId);
        setSelectedServiceName(serviceName);
        setShowFeedbackForm(true);
    };

    const handleBack = () => {
        setShowFeedbackForm(false);
        setSelectedService(null);
    };

    const handleSelect = () => {
        if (selectedService) {
            onSelectService(selectedService);
            onClose();
        }
    };

    if (showFeedbackForm && selectedService) {
        return (
            <FeedbackFormModal
                isOpen={isOpen}
                onClose={onClose}
                windowId={window?.id}
                windowName={windowName}
                serviceId={selectedService}
                serviceName={selectedServiceName}
                onBack={handleBack}
            />
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white p-0 border border-gray-200">
                <div className="p-6">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <Building className="w-6 h-6 text-blue-600" />
                            {windowName || window?.name || "Service Window"}
                        </DialogTitle>
                        <DialogDescription className="text-gray-600">
                            Please select a service from the list below
                        </DialogDescription>
                        <Badge variant="secondary" className="mt-2 bg-blue-50 text-blue-700 border border-blue-200">
                            {services.length} services
                        </Badge>
                    </DialogHeader>

                    <div className="py-4">
                        {isLoading ? (
                            <div className="flex justify-center items-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                                <span className="ml-2 text-gray-600">Loading services...</span>
                            </div>
                        ) : services.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                No services available for this window
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {services.map((service: any, index: number) => (
                                    <div
                                        key={service.id || index}
                                        className="p-4 rounded-lg border-2 border-gray-200 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
                                        onClick={() => handleServiceClick(service.id || index, service.name || `Service ${index + 1}`)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-medium text-sm">
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-800">
                                                        {service.name || `Service ${index + 1}`}
                                                    </p>
                                                    {service.description && (
                                                        <p className="text-sm text-gray-500">
                                                            {service.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-gray-400" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <DialogFooter className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSelect}
                            disabled={!selectedService || isLoading}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Select Service
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}

/* ==========================================================
| Feedback Form Modal
========================================================== */

interface FeedbackFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    windowId: number;
    windowName?: string;
    serviceId: number;
    serviceName: string;
    onBack: () => void;
}

function FeedbackFormModal({
                               isOpen,
                               onClose,
                               windowId,
                               windowName,
                               serviceId,
                               serviceName,
                               onBack,
                           }: FeedbackFormModalProps) {
    const createFeedback = useCreateFeedback();

    const form = useForm<FeedbackFormValues>({
        resolver: zodResolver(feedbackSchema),
        defaultValues: {
            window_id: windowId,
            service_id: serviceId,
            overall_rating: 5,
            staff_behavior: 5,
            waiting_time: 5,
            service_quality: 5,
            cleanliness: 5,
            satisfaction: "highly_satisfied",
            comment: "",
            gender: undefined,
            age: null,
        },
    });

    useEffect(() => {
        form.setValue("window_id", windowId);
        form.setValue("service_id", serviceId);
    }, [windowId, serviceId, form]);

    const onSubmit = async (values: FeedbackFormValues) => {
        try {
            const { window_id, ...payload } = values;
            await createFeedback.mutateAsync(payload as FeedbackPayload);
            toast.success("Thank you for your feedback! 🎉");
            form.reset({
                window_id: undefined,
                service_id: undefined,
                overall_rating: 5,
                staff_behavior: 5,
                waiting_time: 5,
                service_quality: 5,
                cleanliness: 5,
                satisfaction: "highly_satisfied",
                comment: "",
                gender: undefined,
                age: null,
            });
            onClose();
        } catch (error: any) {
            const message =
                error?.response?.data?.message ||
                error.message ||
                "Failed to submit feedback";
            toast.error(message);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border border-gray-200">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onBack}
                            className="text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Back
                        </Button>
                    </div>
                    <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2 mt-2">
                        <Star className="w-6 h-6 text-blue-600 fill-blue-600" />
                        Customer Feedback Form
                    </DialogTitle>
                    <DialogDescription className="text-gray-600">
                        <span className="font-semibold text-gray-800">{windowName}</span> -{" "}
                        <span className="font-semibold text-gray-800">{serviceName}</span>
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Rating Section */}


                        {/* Divider */}
                        <div className="border-t border-gray-200" />

                        {/* Satisfaction & Demographics */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="satisfaction"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-700 font-medium">
                                            Satisfaction
                                        </FormLabel>
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="bg-white border-gray-300 text-gray-800 focus:ring-blue-500 focus:border-blue-500">
                                                    <SelectValue placeholder="Select" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-white border-gray-200">
                                                <SelectItem value="highly_satisfied" className="hover:bg-blue-50 focus:bg-blue-50">
                                                    😊 Highly Satisfied
                                                </SelectItem>
                                                <SelectItem value="satisfied" className="hover:bg-blue-50 focus:bg-blue-50">
                                                    🙂 Satisfied
                                                </SelectItem>
                                                <SelectItem value="not_satisfied" className="hover:bg-blue-50 focus:bg-blue-50">
                                                    😞 Not Satisfied
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className="text-red-500" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="gender"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-700 font-medium">
                                            Gender
                                        </FormLabel>
                                        <Select
                                            value={field.value ?? ""}
                                            onValueChange={(value) =>
                                                field.onChange(value || undefined)
                                            }
                                        >
                                            <FormControl>
                                                <SelectTrigger className="bg-white border-gray-300 text-gray-800 focus:ring-blue-500 focus:border-blue-500">
                                                    <SelectValue placeholder="Select" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-white border-gray-200">
                                                <SelectItem value="male" className="hover:bg-blue-50 focus:bg-blue-50">
                                                    👨 Male
                                                </SelectItem>
                                                <SelectItem value="female" className="hover:bg-blue-50 focus:bg-blue-50">
                                                    👩 Female
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className="text-red-500" />
                                    </FormItem>
                                )}
                            />


                        </div>

                        {/* Divider */}
                        <div className="border-t border-gray-200" />

                        {/* Comment Section */}
                        <FormField
                            control={form.control}
                            name="comment"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-700 font-medium">
                                        Additional Comments
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            rows={4}
                                            placeholder="Share your experience in detail..."
                                            {...field}
                                            value={field.value ?? ""}
                                            className="bg-white border-gray-300 text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500 resize-none"
                                        />
                                    </FormControl>
                                    <FormMessage className="text-red-500" />
                                </FormItem>
                            )}
                        />

                        {/* Submit Button */}
                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </Button>
                            <Button
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                                type="submit"
                                disabled={createFeedback.isPending}
                            >
                                {createFeedback.isPending ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Submitting...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <Heart className="w-4 h-4" />
                                        Submit Feedback
                                    </span>
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

/* ==========================================================
| Main Page Component
========================================================== */

export default function FeedbackPage() {
    const [windowId, setWindowId] = useState<number>();
    const [selectedWindow, setSelectedWindow] = useState<any>(null);
    const [showServicePopup, setShowServicePopup] = useState(false);
    const [selectedServiceId, setSelectedServiceId] = useState<number>();

    /* Load Windows */
    const { data: windowsData, isLoading: windowsLoading } = useWindows();
    const windows = Array.isArray(windowsData) ? windowsData : windowsData?.data ?? [];

    /* Load Services */
    const { data: servicesData, isLoading: servicesLoading } =
        useWindowServices(windowId);
    const services = Array.isArray(servicesData) ? servicesData : servicesData?.data ?? [];

    /* Create Feedback */
    const createFeedback = useCreateFeedback();

    /* Handle Window Click */
    const handleWindowClick = (window: any) => {
        setWindowId(window.id);
        setSelectedWindow(window);
        setShowServicePopup(true);
    };

    /* Handle Service Selection */
    const handleServiceSelect = (serviceId: number) => {
        setSelectedServiceId(serviceId);
        setShowServicePopup(false);
    };

    /* Handle Close Popup */
    const handleClosePopup = () => {
        setShowServicePopup(false);
        setSelectedWindow(null);
        setWindowId(undefined);
    };

    return (
        <div className="min-h-screen bg-[#060d1a] text-blue-100">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-900 to-blue-950 text-white py-8 px-4 shadow-lg border-b border-blue-800/30">
                <div className="container mx-auto max-w-6xl">
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-500/20 p-3 rounded-full border border-blue-400/30">
                            <Heart className="w-8 h-8 text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-blue-100">
                                Adama City Customer Satisfaction Survey
                            </h1>
                            <p className="text-blue-300/70 mt-1">
                                Your feedback helps us improve our services
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto max-w-6xl py-8 px-4">
                {/* Service Windows Grid */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-blue-200 flex items-center gap-2">
                            <Building className="w-5 h-5 text-blue-400" />
                            Select a Service Window
                        </h2>
                        <Badge variant="secondary" className="bg-blue-900/50 text-blue-300 border border-blue-700/30">
                            {windows.length} services
                        </Badge>
                    </div>

                    {windowsLoading ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                            <span className="ml-2 text-blue-300">Loading windows...</span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {windows.map((window: any) => (
                                <Card
                                    key={window.id}
                                    className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/10 hover:border-blue-400 border-2 border-blue-800/30 hover:-translate-y-1 bg-white"
                                    onClick={() => handleWindowClick(window)}
                                >
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base font-semibold text-gray-800">
                                            {window.name || `Foddaa ${window.id}`}
                                        </CardTitle>
                                        <CardDescription className="text-xs text-gray-500 flex items-center gap-1">
                                            <Users className="w-3 h-3" />
                                            {servicesLoading && windowId === window.id
                                                ? "Loading..."
                                                : `${services.length || 0} services available`}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-400">
                                                Click to view services
                                            </span>
                                            <ChevronRight className="w-4 h-4 text-blue-600" />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Service Selection Popup */}
                <ServicePopup
                    isOpen={showServicePopup}
                    onClose={handleClosePopup}
                    window={selectedWindow}
                    windowName={selectedWindow?.name}
                    services={services}
                    onSelectService={handleServiceSelect}
                    isLoading={servicesLoading}
                />

                {/* Footer */}
                <p className="text-center text-sm text-blue-400/30 mt-8">
                    Your feedback helps us improve our services. Thank you for your time!
                </p>
            </div>
        </div>
    );
}