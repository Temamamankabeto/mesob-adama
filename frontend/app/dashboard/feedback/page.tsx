"use client";

import { useState } from "react";
import feedbackService from "@/services/feedback.service";
import type { FeedbackPayload } from "@/types/feedback";

export default function FeedbackPage() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: FeedbackPayload) => {
    try {
      setLoading(true);

      await feedbackService.create(data);

      alert("Feedback submitted successfully.");
    } catch (error) {
      console.error("Submit feedback failed:", error);
      alert("Failed to submit feedback.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Feedback</h1>

      {/* Replace this with your actual form */}
      <button
        onClick={() =>
          handleSubmit({
            // Fill with your actual FeedbackPayload fields
          } as FeedbackPayload)
        }
        disabled={loading}
      >
        {loading ? "Submitting..." : "Submit Feedback"}
      </button>
    </div>
  );
}