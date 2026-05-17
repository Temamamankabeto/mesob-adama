"use client";

import { CheckCircle2, Circle, Clock3 } from "lucide-react";

import { cn } from "@/lib/utils";
import { ServiceApplicationHistory, ServiceApplicationWorkflow } from "@/types/application-workflow";

type Props = {
  workflow?: ServiceApplicationWorkflow[];
  histories?: ServiceApplicationHistory[];
};

export default function ApplicationWorkflowTimeline({ workflow = [], histories = [] }: Props) {
  const items = workflow.length
    ? workflow.map((item) => ({
        id: item.id,
        title: item.window?.name || item.status,
        status: item.status,
        note: item.remark || item.comment,
        date: item.acted_at,
      }))
    : histories.map((item) => ({
        id: item.id,
        title: item.action,
        status: item.to_status,
        note: item.remark,
        date: item.created_at,
      }));

  if (!items.length) {
    return <p className="text-sm text-muted-foreground">No workflow history yet.</p>;
  }

  return (
    <div className="space-y-4">
      {items.map((item, index) => {
        const done = ["approved", "completed", "rejected", "returned"].includes(item.status);
        const active = ["processing", "submitted", "under_review"].includes(item.status);

        return (
          <div key={item.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              {done ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : active ? (
                <Clock3 className="h-5 w-5 text-amber-600" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}

              {index < items.length - 1 && <div className="mt-2 h-full w-px bg-border" />}
            </div>

            <div className={cn("flex-1 rounded-2xl border p-4", active && "bg-amber-50")}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="font-semibold capitalize">{item.title.replaceAll("_", " ")}</h4>
                <span className="text-xs text-muted-foreground">{item.date ? new Date(item.date).toLocaleString() : item.status}</span>
              </div>

              {item.note && <p className="mt-2 text-sm text-muted-foreground">{item.note}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
