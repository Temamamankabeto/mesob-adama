"use client";

import { Download, FileText } from "lucide-react";

import { ServiceApplicationFile } from "@/types/application-workflow";

// Backend origin (Laravel), derived from the API base URL so file links
// resolve correctly even when the frontend and backend run on different
// hosts/ports (e.g. localhost:3000 vs 127.0.0.1:8000).
const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api").replace(
    /\/api\/?$/,
    ""
);

function fileUrl(file: any) {
  if (file.download_url) return file.download_url;
  if (!file.path) return "#";
  if (String(file.path).startsWith("http")) return file.path;

  const path = String(file.path).replace(/^\/+/, "");
  return `${API_ORIGIN}/storage/${path}`;
}

function fileStatus(file: any) {
  return file.display_status || file.display_category || "Available";
}

function fileCategory(file: any) {
  return file.display_category || file.file_category || file.field_name || "document";
}

export default function ApplicationFilesList({ files = [] }: { files?: ServiceApplicationFile[] }) {
  if (!files.length) {
    return <p className="text-sm text-muted-foreground">No files uploaded.</p>;
  }

  return (
      <div className="space-y-3">
        {files.map((file: any) => (
            <a
                key={file.id}
                href={fileUrl(file)}
                target="_blank"
                rel="noreferrer"
                download
                className="flex items-center justify-between gap-4 rounded-2xl border p-4 transition hover:bg-muted"
            >
          <span className="flex min-w-0 items-center gap-3">
            <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
            <span className="min-w-0">
              <span className="block truncate font-medium">{file.original_name}</span>
              <span className="text-xs text-muted-foreground">{fileCategory(file)}{file.uploader?.name ? ` · By ${file.uploader.name}` : ""}</span>
            </span>
          </span>

              <span className="flex shrink-0 items-center gap-2">
            <span className="rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
              {fileStatus(file)}
            </span>
            <Download className="h-4 w-4 text-muted-foreground" />
          </span>
            </a>
        ))}
      </div>
  );
}
