"use client";

import { ReactNode } from "react";

import { Toaster } from "@/components/ui/sonner";
import { ReactQueryProvider } from "@/providers/react-query-provider";
import { ReduxProvider } from "@/providers/ReduxProvider";

type AppProvidersProps = {
  children: ReactNode;
};

export default function Providers({
  children,
}: AppProvidersProps) {
  return (
    <ReduxProvider>
      <ReactQueryProvider>
        {children}
        <Toaster richColors position="top-right" />
      </ReactQueryProvider>
    </ReduxProvider>
  );
}