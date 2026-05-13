"use client";

import { FileText } from "lucide-react";

import { ServiceApplicationFile } from "@/types/application-workflow";

export default function ApplicationFilesList({ files = [] }: { files?: ServiceApplicationFile[] }) {
  if (!files.length) {
    return <p className="text-sm text-muted-foreground">No files uploaded.</p>;
  }

  return (
    <div className="space-y-3">
      {files.map((file) => (
        <a
          key={file.id}
          href={file.path?.startsWith("http") ? file.path : `/storage/${file.path}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between rounded-2xl border p-4 transition hover:bg-muted"
        >
          <span className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <span>
              <span className="block font-medium">{file.original_name}</span>
              <span className="text-xs text-muted-foreground">{file.field_name}</span>
            </span>
          </span>

          <span className="text-xs text-muted-foreground">{file.verification_status || "pending"}</span>
        </a>
      ))}
    </div>
  );
}
