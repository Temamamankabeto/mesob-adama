"use client";

import { useParams } from "next/navigation";

export default function CustomerFeedbackPage() {
  const params = useParams();

  return (
    <div className="container mx-auto max-w-2xl py-10">
      <h1 className="text-2xl font-bold mb-6">
        Customer Satisfaction Survey
      </h1>

      <p className="mb-6">
        Please tell us how satisfied you are with the service.
      </p>

      <div className="space-y-3">
        <button className="w-full rounded border p-3">
          Very Satisfied
        </button>

        <button className="w-full rounded border p-3">
          Satisfied
        </button>

        <button className="w-full rounded border p-3">
          Not Satisfied
        </button>

        <button className="w-full rounded border p-3">
          Other
        </button>
      </div>

      <div className="mt-4 text-sm text-muted-foreground">
        Token: {params.token}
      </div>
    </div>
  );
}