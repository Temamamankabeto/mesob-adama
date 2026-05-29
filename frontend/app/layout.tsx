import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/providers/AppProviders";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const siteDescription =
  "Adama MESOB eService is a unified role based digital government service platform designed to modernize public service delivery in Adama City Administration. The system enables citizens, businesses, and government institutions to access services online efficiently, securely, and transparently.";

export const metadata: Metadata = {
  metadataBase: new URL("https://mesob.adamacity.gov.et"),
  title: {
    default: "Adama MESOB eService",
    template: "%s | Adama MESOB eService",
  },
  description: siteDescription,
  applicationName: "Adama MESOB eService",
  keywords: [
    "Adama MESOB eService",
    "Adama City Administration",
    "digital government service",
    "public service delivery",
    "eService",
  ],
  openGraph: {
    title: "Adama MESOB eService",
    description: siteDescription,
    url: "https://mesob.adamacity.gov.et",
    siteName: "Adama MESOB eService",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Adama MESOB eService",
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <body className="antialiased">
        <Providers>{children}</Providers>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
