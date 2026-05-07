"use client";

import Link from "next/link";
import { useState } from "react";

import {
  ArrowRight,
  Bell,
  Building2,
  Check,
  ChevronRight,
  FileSearch,
  Languages,
  Menu,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Star,
  Users2,
} from "lucide-react";

import {
  useHomepage,
  useTrackApplication,
} from "@/hooks/home/use-home";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function HomePage() {

  const [
    applicationNumber,
    setApplicationNumber,
  ] = useState("");

  const [language, setLanguage] =
    useState("en");

  const { data, isLoading } =
    useHomepage();

  const trackMutation =
    useTrackApplication();

  const handleTrack =
    async () => {

      if (!applicationNumber) {

        alert(
          "Enter application number"
        );

        return;
      }

      try {

        const response =
          await trackMutation.mutateAsync({
            application_number:
              applicationNumber,
          });

        alert(
          `Status: ${response.data.status}`
        );

      } catch (error) {

        console.error(error);
      }
    };

  const languages = [
    {
      code: "en",
      name: "English",
      flag: "🇬🇧",
    },
    {
      code: "am",
      name: "አማርኛ",
      flag: "🇪🇹",
    },
    {
      code: "om",
      name: "Afaan Oromoo",
      flag: "🇪🇹",
    },
  ];

  if (isLoading) {

    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden bg-background text-foreground">

      {/* BACKGROUND */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">

        <div className="absolute left-[-100px] top-[100px] h-[500px] w-[500px] rounded-full bg-primary/10 blur-3xl" />

        <div className="absolute right-[-150px] top-[150px] h-[600px] w-[600px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-xl">

        <div className="container mx-auto flex h-20 items-center justify-between px-6">

          {/* LOGO */}
          <Link
            href="/"
            className="flex items-center gap-3"
          >

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">

              <Building2 className="h-5 w-5" />
            </div>

            <div>

              <h1 className="text-lg font-bold tracking-tight">
                MESOB Adama
              </h1>

              <p className="text-xs text-muted-foreground">
                Digital Government
              </p>
            </div>
          </Link>

          {/* NAV */}
          <nav className="hidden items-center gap-8 lg:flex">

            <Link
              href="/"
              className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
            >
              Home
            </Link>

            <Link
              href="/service"
              className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
            >
              Services
            </Link>
             <Link
              href="/service"
              className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
            >
              Contact
            </Link>
                <Link
              href="/service"
              className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
            >
              News
            </Link>
          </nav>

          {/* ACTIONS */}
          <div className="hidden items-center gap-3 lg:flex">

            {/* LANGUAGE */}
            <DropdownMenu>

              <DropdownMenuTrigger asChild>

                <Button
                  variant="ghost"
                  className="gap-2 rounded-xl"
                >
                  <Languages className="h-4 w-4" />

                  <span>
                    {
                      languages.find(
                        (l) =>
                          l.code ===
                          language
                      )?.flag
                    }
                  </span>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
              >

                {languages.map(
                  (lang) => (

                    <DropdownMenuItem
                      key={lang.code}
                      onClick={() =>
                        setLanguage(
                          lang.code
                        )
                      }
                      className="flex items-center justify-between"
                    >

                      <span className="flex items-center gap-2">

                        <span>
                          {
                            lang.flag
                          }
                        </span>

                        <span>
                          {
                            lang.name
                          }
                        </span>
                      </span>

                      {language ===
                        lang.code && (
                        <Check className="h-4 w-4" />
                      )}
                    </DropdownMenuItem>
                  )
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/login">

              <Button
                variant="ghost"
                className="rounded-xl"
              >
                Login
              </Button>
            </Link>

            <Link href="/register">

              <Button className="rounded-xl">
                Register
              </Button>
            </Link>
          </div>

          {/* MOBILE */}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border">

        <div className="container mx-auto px-6 py-24 lg:py-32">

          <div className="mx-auto max-w-5xl text-center">

            {/* BADGE */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 shadow-sm">

              <Sparkles className="h-4 w-4 text-primary" />

              <span className="text-sm font-medium text-muted-foreground">
                Official Government Platform
              </span>
            </div>

            {/* TITLE */}
            <h1 className="text-5xl font-black tracking-tight text-foreground sm:text-4xl lg:text-3xl">

              Smart Digital Government Services
            </h1>

            {/* DESCRIPTION */}
            <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-muted-foreground">

              Access integrated city services, track applications, and manage your information securely from a single digital platform.
            </p>

            {/* SEARCH */}
            <div className="mx-auto mt-12 max-w-2xl">

              <div className="flex flex-col gap-3 rounded-3xl border border-border bg-card p-3 shadow-xl sm:flex-row">

                <div className="relative flex-1">

                  <FileSearch className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />

                  <Input
                    placeholder="Enter application number"

                    className="h-12 border-0 bg-transparent pl-11 shadow-none focus-visible:ring-0"

                    value={
                      applicationNumber
                    }

                    onChange={(e) =>
                      setApplicationNumber(
                        e.target.value
                      )
                    }
                  />
                </div>

                <Button
                  onClick={
                    handleTrack
                  }

                  disabled={
                    trackMutation.isPending
                  }

                  className="h-12 rounded-2xl px-8"
                >
                  Track Status
                </Button>
              </div>
            </div>

            {/* STATS */}
            <div className="mt-20 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

              {/* SERVICES */}
              <Card className="border-border bg-card/80 shadow-sm backdrop-blur">

                <CardContent className="flex items-center gap-4 p-5">

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">

                    <Building2 className="h-6 w-6" />
                  </div>

                  <div className="text-left">

                    <p className="text-2xl font-bold">
                      {
                        data?.data
                          ?.statistics
                          ?.total_services || 0
                      }
                    </p>

                    <p className="text-xs text-muted-foreground">
                      Services
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* USERS */}
              <Card className="border-border bg-card/80 shadow-sm backdrop-blur">

                <CardContent className="flex items-center gap-4 p-5">

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">

                    <Users2 className="h-6 w-6" />
                  </div>

                  <div className="text-left">

                    <p className="text-2xl font-bold">
                      {
                        data?.data
                          ?.statistics
                          ?.total_officers || 0
                      }
                    </p>

                    <p className="text-xs text-muted-foreground">
                      Officers
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* APPLICATIONS */}
              <Card className="border-border bg-card/80 shadow-sm backdrop-blur">

                <CardContent className="flex items-center gap-4 p-5">

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">

                    <FileSearch className="h-6 w-6" />
                  </div>

                  <div className="text-left">

                    <p className="text-2xl font-bold">
                      {
                        data?.data
                          ?.statistics
                          ?.processed_applications || 0
                      }
                    </p>

                    <p className="text-xs text-muted-foreground">
                      Applications
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* SATISFACTION */}
              <Card className="border-border bg-card/80 shadow-sm backdrop-blur">

                <CardContent className="flex items-center gap-4 p-5">

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">

                    <Star className="h-6 w-6 fill-primary stroke-primary" />
                  </div>

                  <div className="text-left">

                    <p className="text-2xl font-bold">
                      94%
                    </p>

                    <p className="text-xs text-muted-foreground">
                      Satisfaction
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="py-24">

        <div className="container mx-auto px-6">

          <div className="mb-14 text-center">

            <h2 className="text-4xl font-bold tracking-tight">
              Popular Digital Services
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">

              Access integrated government services digitally anytime and anywhere.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

            {data?.data?.featured_services?.map(
              (service) => (

                <Card
                  key={service.id}
                  className="group border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >

                  <CardContent className="p-6">

                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">

                      <ShieldCheck className="h-7 w-7" />
                    </div>

                    <h3 className="mt-6 text-xl font-semibold">

                      {service.name}
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-muted-foreground">

                      {
                        service.description
                      }
                    </p>

                    <div className="mt-8 flex items-center justify-between border-t border-border pt-5">

                      <div>

                        <p className="text-xs text-muted-foreground">
                          Service Fee
                        </p>

                        <p className="text-lg font-bold text-primary">

                          ETB {service.service_fee}
                        </p>
                      </div>

                      <Link
                        href={`/service/${service.id}`}
                      >

                        <Button
                          size="sm"
                          className="rounded-xl"
                        >
                          Apply
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
            )}
          </div>

          {/* VIEW ALL */}
          <div className="mt-10 text-center">

            <Link href="/service">

              <Button
                variant="outline"
                className="rounded-xl"
              >
                View All Services

                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FEEDBACK */}
      <section className="border-t border-border bg-muted/30 py-20">

        <div className="container mx-auto px-6 text-center">

          <div className="mx-auto max-w-2xl">

            <div className="mb-5 flex justify-center">

              <div className="rounded-2xl bg-primary/10 p-4 text-primary">

                <MessageCircle className="h-6 w-6" />
              </div>
            </div>

            <h2 className="text-3xl font-bold">
              Leave Your Feedback
            </h2>

            <p className="mt-4 text-muted-foreground">

              Help us improve our services by sharing your feedback or reporting issues.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">

              <Button className="rounded-xl">
                Give Feedback

                <Star className="ml-2 h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                className="rounded-xl"
              >
                Report Issue
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border bg-background">

        <div className="container mx-auto px-6 py-12">

          <div className="grid gap-10 md:grid-cols-4">

            {/* BRAND */}
            <div className="col-span-2">

              <Link
                href="/"
                className="flex items-center gap-3"
              >

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">

                  <Building2 className="h-5 w-5" />
                </div>

                <span className="font-bold">
                  MESOB Adama
                </span>
              </Link>

              <p className="mt-4 text-sm text-muted-foreground">

                Official Digital Government Platform of Adama City.
              </p>
            </div>

            {/* LINKS */}
            <div>

              <h4 className="font-semibold">
                Quick Links
              </h4>

              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">

                <li>
                  <Link
                    href="/about"
                    className="hover:text-foreground"
                  >
                    About
                  </Link>
                </li>

                <li>
                  <Link
                    href="/service"
                    className="hover:text-foreground"
                  >
                    Services
                  </Link>
                </li>

                <li>
                  <Link
                    href="/contact"
                    className="hover:text-foreground"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* LEGAL */}
            <div>

              <h4 className="font-semibold">
                Legal
              </h4>

              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">

                <li>
                  <Link
                    href="/privacy"
                    className="hover:text-foreground"
                  >
                    Privacy
                  </Link>
                </li>

                <li>
                  <Link
                    href="/terms"
                    className="hover:text-foreground"
                  >
                    Terms
                  </Link>
                </li>

                <li>
                  <Link
                    href="/security"
                    className="hover:text-foreground"
                  >
                    Security
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* COPYRIGHT */}
          <div className="mt-10 border-t border-border pt-6 text-center text-xs text-muted-foreground">

            © 2025 MESOB Adama Digital Government Platform
          </div>
        </div>
      </footer>
    </div>
  );
}