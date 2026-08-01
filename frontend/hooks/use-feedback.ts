"use client";

import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import feedbackService from "@/services/feedback.service";

import type {
    FeedbackFilters,
    FeedbackPayload,
    UpdateFeedbackPayload,
} from "@/types/feedback";

/* ==========================================================
 * Query Keys
 * ========================================================== */

export const feedbackKeys = {

    all: ["feedback"] as const,

    windows: ["feedback", "windows"] as const,

    services: (windowId?: number) =>
        ["feedback", "services", windowId] as const,

    lists: ["feedback", "list"] as const,

    list: (filters?: FeedbackFilters) =>
        ["feedback", "list", filters] as const,

    detail: (id: number) =>
        ["feedback", "detail", id] as const,

};

/* ==========================================================
 * WINDOWS
 * ========================================================== */

export function useWindows() {

    return useQuery({

        queryKey: feedbackKeys.windows,

        queryFn: () =>
            feedbackService.getWindows(),

    });

}

/* ==========================================================
 * SERVICES OF WINDOW
 * ========================================================== */

export function useWindowServices(
    windowId?: number
) {

    return useQuery({

        queryKey: feedbackKeys.services(windowId),

        queryFn: () =>
            feedbackService.getServicesByWindow(
                windowId!
            ),

        enabled: !!windowId,

    });

}

/* ==========================================================
 * GET ALL FEEDBACK
 * ========================================================== */

export function useFeedback(
    filters?: FeedbackFilters
) {

    return useQuery({

        queryKey: feedbackKeys.list(filters),

        queryFn: () =>
            feedbackService.getAll(filters),

    });

}

/* ==========================================================
 * GET SINGLE FEEDBACK
 * ========================================================== */

export function useFeedbackDetails(
    id: number
) {

    return useQuery({

        queryKey: feedbackKeys.detail(id),

        queryFn: () =>
            feedbackService.getById(id),

        enabled: !!id,

    });

}

/* ==========================================================
 * CREATE FEEDBACK
 * ========================================================== */

export function useCreateFeedback() {

    const queryClient = useQueryClient();

    return useMutation({

        mutationFn: (
            payload: FeedbackPayload
        ) =>
            feedbackService.create(payload),

        onSuccess: () => {

            queryClient.invalidateQueries({

                queryKey: feedbackKeys.lists,

            });

        },

    });

}

/* ==========================================================
 * UPDATE FEEDBACK
 * ========================================================== */

export function useUpdateFeedback() {

    const queryClient = useQueryClient();

    return useMutation({

        mutationFn: ({
                         id,
                         payload,
                     }: {
            id: number;
            payload: UpdateFeedbackPayload;
        }) =>
            feedbackService.update(
                id,
                payload
            ),

        onSuccess: (_, variables) => {

            queryClient.invalidateQueries({

                queryKey: feedbackKeys.lists,

            });

            queryClient.invalidateQueries({

                queryKey: feedbackKeys.detail(
                    variables.id
                ),

            });

        },

    });

}

/* ==========================================================
 * DELETE FEEDBACK
 * ========================================================== */

export function useDeleteFeedback() {

    const queryClient = useQueryClient();

    return useMutation({

        mutationFn: (id: number) =>
            feedbackService.delete(id),

        onSuccess: () => {

            queryClient.invalidateQueries({

                queryKey: feedbackKeys.lists,

            });

        },

    });

}

/* ==========================================================
 * FILTER FEEDBACK
 * ========================================================== */

export function useFilteredFeedback(
    filters: FeedbackFilters
) {

    return useQuery({

        queryKey: ["feedback-filter", filters],

        queryFn: () =>
            feedbackService.filter(filters),

    });

}

/* ==========================================================
 * PAGINATION
 * ========================================================== */

export function useFeedbackPagination(
    page = 1,
    perPage = 20
) {

    return useQuery({

        queryKey: [
            "feedback-page",
            page,
            perPage,
        ],

        queryFn: () =>
            feedbackService.paginate(
                page,
                perPage
            ),

    });

}