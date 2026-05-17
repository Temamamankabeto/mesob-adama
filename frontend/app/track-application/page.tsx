"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function TrackApplicationRedirectPage() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const query = params.toString();
    router.replace(`/dashboard/track-application${query ? `?${query}` : ""}`);
  }, [router, params]);

  return null;
}
