import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/providers/AppProviders";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";
import ChatbotWidget from "@/components/chatbot/ChatbotWidget";
import I18nProvider from "@/providers/I18nProvider";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const siteDescription =
  "Adama MESOB eService is a unified role based digital government service platform designed to modernize public service delivery in Adama City Administration.";

export const metadata: Metadata = {
  metadataBase: new URL("https://mesob.adamacity.gov.et"),
  title: {
    default: "Adama MESOB eService",
    template: "%s | Adama MESOB eService",
  },
  description: siteDescription,
  applicationName: "Adama MESOB eService",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <body className="antialiased">
        <Providers>
          {children}
          <ChatbotWidget source="global" />
        </Providers>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
