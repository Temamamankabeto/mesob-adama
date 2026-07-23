"use client";

import { useMemo, useState } from "react";
import { Loader2, MapPin, MessageSquareText, Star } from "lucide-react";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { useFeedback } from "@/hooks/use-feedback";
import type { Feedback, FeedbackFilters, Satisfaction } from "@/types/feedback";

/* ==========================================================
 * Helpers
 * ========================================================== */

const satisfactionBadge: Record<
    Satisfaction,
    { label: string; className: string }
> = {
    highly_satisfied: {
        label: "Highly Satisfied",
        className: "bg-emerald-600 text-white hover:bg-emerald-600",
    },
    satisfied: {
        label: "Satisfied",
        className: "bg-amber-500 text-white hover:bg-amber-500",
    },
    not_satisfied: {
        label: "Not Satisfied",
        className: "bg-rose-600 text-white hover:bg-rose-600",
    },
};

function locationLabel(feedback: Feedback): string {
    const window = feedback.window;

    if (!window) {
        return "Unspecified location";
    }

    const parts = [window.city?.name, window.subcity?.name, window.woreda?.name].filter(
        Boolean
    );

    return parts.length > 0 ? parts.join(" / ") : window.name;
}

/* ==========================================================
 * Page
 * ========================================================== */

export default function AgentFeedbackPage() {
    const [satisfaction, setSatisfaction] = useState<Satisfaction | "all">(
        "all"
    );
    const [page, setPage] = useState(1);

    const filters = useMemo<FeedbackFilters>(() => {
        const value: FeedbackFilters = { page, per_page: 20 };

        if (satisfaction !== "all") {
            value.satisfaction = satisfaction;
        }

        return value;
    }, [satisfaction, page]);

    const { data, isLoading, isError } = useFeedback(filters);

    const feedbacks = data?.data ?? [];
    const meta = data?.meta;

    return (
        <div className="space-y-6 p-6">
            <div>
                <h1 className="text-2xl font-bold">Customer Feedback</h1>
                <p className="text-sm text-muted-foreground">
                    Feedback left at the windows in your city, subcity, or
                    woreda. You only see feedback within your own
                    jurisdiction.
                </p>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-base">
                            All feedback
                        </CardTitle>
                        <CardDescription>
                            {meta?.total ?? 0} total submissions
                        </CardDescription>
                    </div>

                    <Select
                        value={satisfaction}
                        onValueChange={(value) => {
                            setSatisfaction(value as Satisfaction | "all");
                            setPage(1);
                        }}
                    >
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Filter by satisfaction" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">
                                All satisfaction levels
                            </SelectItem>
                            <SelectItem value="highly_satisfied">
                                Highly Satisfied
                            </SelectItem>
                            <SelectItem value="satisfied">
                                Satisfied
                            </SelectItem>
                            <SelectItem value="not_satisfied">
                                Not Satisfied
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </CardHeader>

                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading feedback...
                        </div>
                    ) : isError ? (
                        <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
                            <MessageSquareText className="h-8 w-8" />
                            Couldn&apos;t load feedback. Please sign in and
                            try again.
                        </div>
                    ) : feedbacks.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
                            <MessageSquareText className="h-8 w-8" />
                            No feedback found for your location yet.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Service</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Rating</TableHead>
                                    <TableHead>Satisfaction</TableHead>
                                    <TableHead>Comment</TableHead>
                                    <TableHead className="text-right">
                                        Submitted
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {feedbacks.map((feedback) => (
                                    <TableRow key={feedback.id}>
                                        <TableCell className="font-medium">
                                            {feedback.service?.name ?? "—"}
                                        </TableCell>
                                        <TableCell>
                                            <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                                                <MapPin className="h-3.5 w-3.5" />
                                                {locationLabel(feedback)}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="inline-flex items-center gap-1">
                                                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                                {feedback.overall_rating ?? "—"}
                                                /5
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={
                                                    satisfactionBadge[
                                                        feedback.satisfaction
                                                    ].className
                                                }
                                            >
                                                {
                                                    satisfactionBadge[
                                                        feedback.satisfaction
                                                    ].label
                                                }
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="max-w-[280px] truncate text-sm text-muted-foreground">
                                            {feedback.comment || "—"}
                                        </TableCell>
                                        <TableCell className="text-right text-sm text-muted-foreground">
                                            {new Date(
                                                feedback.created_at
                                            ).toLocaleDateString()}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}

                    {meta && meta.last_page > 1 && (
                        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                            <span>
                                Page {meta.current_page} of {meta.last_page}
                            </span>
                            <div className="flex gap-2">
                                <button
                                    className="rounded-md border px-3 py-1 disabled:opacity-50"
                                    disabled={meta.current_page <= 1}
                                    onClick={() =>
                                        setPage((p) => Math.max(1, p - 1))
                                    }
                                >
                                    Previous
                                </button>
                                <button
                                    className="rounded-md border px-3 py-1 disabled:opacity-50"
                                    disabled={
                                        meta.current_page >= meta.last_page
                                    }
                                    onClick={() => setPage((p) => p + 1)}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
