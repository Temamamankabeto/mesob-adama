"use client";

import Link from "next/link";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowRight,
  Layers3,
  Search,
  ShieldCheck,
  Sparkles,
  Phone,
  TrendingUp,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";

import { ScrollArea } from "@/components/ui/scroll-area";

import { cn } from "@/lib/utils";

import { useWindowServices } from "@/hooks/public-service/use-public-service";

const ITEMS_PER_PAGE = 12;

export default function PublicServicesPage() {

  const [search, setSearch] =
    useState("");

  const [selectedWindow, setSelectedWindow] =
    useState<number | null>(null);

  const [page, setPage] =
    useState(1);

  const {
    data,
    isLoading,
    error,
  } = useWindowServices();

  /*
  |--------------------------------------------------------------------------
  | WINDOWS
  |--------------------------------------------------------------------------
  */

  const windows =
    data?.data || [];

  /*
  |--------------------------------------------------------------------------
  | ALL SERVICES
  |--------------------------------------------------------------------------
  */

  const allServices = useMemo(() => {

    return windows.flatMap(
      (window: any) =>
        window.services.map(
          (service: any) => ({

            ...service,

            window_name:
              window.name,
          })
        )
    );

  }, [windows]);

  /*
  |--------------------------------------------------------------------------
  | FILTERED SERVICES
  |--------------------------------------------------------------------------
  */

  const filteredServices = useMemo(() => {

    let services =
      selectedWindow
        ? windows.find(
            (window: any) =>
              window.id ===
              selectedWindow
          )?.services || []
        : allServices;

    if (search) {

      services = services.filter(
        (service: any) =>
          service.name
            .toLowerCase()
            .includes(
              search.toLowerCase()
            ) ||
          service.description
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            )
      );
    }

    return services;

  }, [
    windows,
    selectedWindow,
    search,
    allServices,
  ]);

  /*
  |--------------------------------------------------------------------------
  | PAGINATION
  |--------------------------------------------------------------------------
  */

  const totalPages =
    Math.ceil(
      filteredServices.length /
        ITEMS_PER_PAGE
    );

  const paginatedServices =
    filteredServices.slice(
      (page - 1) *
        ITEMS_PER_PAGE,
      page * ITEMS_PER_PAGE
    );

  useEffect(() => {

    setPage(1);

  }, [
    selectedWindow,
    search,
  ]);

  const totalServices =
    allServices.length;

  const activeWindows =
    windows.length;

  return (
    <div className="min-h-screen bg-background">

      {/* HERO */}
      <section className="border-b border-border bg-muted/30">

        <div className="container mx-auto px-4 py-16">

          <div className="mx-auto max-w-4xl text-center">

            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 shadow-sm">

              <ShieldCheck className="h-4 w-4 text-primary" />

              <span className="text-sm font-medium text-muted-foreground">

                Public Digital Services
              </span>

              <Sparkles className="h-4 w-4 text-primary" />
            </div>

            <h1 className="text-4xl font-black tracking-tight md:text-6xl">

              Government Services
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">

              Browse all government
              services grouped by
              service windows.
            </p>

            {/* STATS */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-8">

              <div className="text-center">

                <h3 className="text-3xl font-black text-primary">

                  {totalServices}
                </h3>

                <p className="text-sm text-muted-foreground">

                  Services
                </p>
              </div>

              <div className="text-center">

                <h3 className="text-3xl font-black text-primary">

                  {activeWindows}
                </h3>

                <p className="text-sm text-muted-foreground">

                  Windows
                </p>
              </div>

              <div className="text-center">

                <h3 className="text-3xl font-black text-primary">

                  24h
                </h3>

                <p className="text-sm text-muted-foreground">

                  Avg Response
                </p>
              </div>
            </div>

            {/* SEARCH */}
            <div className="mx-auto mt-10 max-w-2xl">

              <div className="flex items-center gap-3 rounded-3xl border border-border bg-card p-3 shadow-lg">

                <div className="relative flex-1">

                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />

                  <Input
                    placeholder="Search services..."
                    className="h-12 border-0 bg-transparent pl-11 shadow-none focus-visible:ring-0"
                    value={search}
                    onChange={(e) =>
                      setSearch(
                        e.target.value
                      )
                    }
                  />
                </div>

                <Button className="h-12 rounded-2xl px-8">

                  Search
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="py-10">

        <div className="container mx-auto px-4">

          <div className="grid gap-8 lg:grid-cols-[280px_1fr]">

            {/* SIDEBAR */}
            <div>

              <div className="sticky top-24 rounded-3xl border border-border bg-card shadow-sm">

                {/* HEADER */}
                <div className="border-b border-border p-5">

                  <div className="flex items-center gap-2">

                    <Layers3 className="h-5 w-5 text-primary" />

                    <div>

                      <h2 className="text-lg font-bold">

                        Windows
                      </h2>

                      <p className="text-xs text-muted-foreground">

                        Browse by category
                      </p>
                    </div>
                  </div>
                </div>

                {/* WINDOW LIST */}
                <ScrollArea className="h-[650px]">

                  <div className="space-y-2 p-4">

                    {/* ALL */}
                    <button
                      onClick={() =>
                        setSelectedWindow(
                          null
                        )
                      }
                      className={cn(
                        "w-full rounded-2xl border p-4 text-left transition-all",

                        !selectedWindow
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:bg-muted"
                      )}
                    >

                      <div className="flex items-center justify-between">

                        <div>

                          <p className="font-semibold">

                            All Services
                          </p>

                          <p className="mt-1 text-xs opacity-70">

                            View all
                          </p>
                        </div>

                        <Badge
                          variant={
                            !selectedWindow
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {
                            allServices.length
                          }
                        </Badge>
                      </div>
                    </button>

                    {/* WINDOWS */}
                    {windows.map(
                      (
                        window: any
                      ) => (

                        <button
                          key={window.id}
                          onClick={() =>
                            setSelectedWindow(
                              window.id
                            )
                          }
                          className={cn(
                            "w-full rounded-2xl border p-4 text-left transition-all",

                            selectedWindow ===
                              window.id
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border hover:bg-muted"
                          )}
                        >

                          <div className="flex items-center justify-between">

                            <div>

                              <p className="font-semibold">

                                {
                                  window.name
                                }
                              </p>

                              <div className="mt-2 flex flex-wrap gap-1">

                                {window.availability
                                  ?.slice(0, 2)
                                  .map(
                                    (
                                      item: string
                                    ) => (

                                      <span
                                        key={
                                          item
                                        }
                                        className="text-[10px] opacity-70"
                                      >
                                        {
                                          item
                                        }
                                      </span>
                                    )
                                  )}
                              </div>
                            </div>

                            <Badge
                              variant={
                                selectedWindow ===
                                window.id
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {
                                window
                                  .services
                                  ?.length
                              }
                            </Badge>
                          </div>
                        </button>
                      )
                    )}
                  </div>
                </ScrollArea>

                {/* FOOTER */}
                <div className="border-t border-border p-4">

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">

                    <Phone className="h-3 w-3" />

                    <span>
                      Need help? Contact support
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* SERVICES */}
            <div>

              {/* HEADER */}
              <div className="mb-6 flex items-center justify-between">

                <div>

                  <div className="flex items-center gap-2 text-primary">

                    <TrendingUp className="h-4 w-4" />

                    <span className="text-sm font-medium">

                      Available Services
                    </span>
                  </div>

                  <h2 className="mt-2 text-3xl font-black">

                    {selectedWindow
                      ? windows.find(
                          (
                            window: any
                          ) =>
                            window.id ===
                            selectedWindow
                        )?.name
                      : "All Services"}
                  </h2>

                  <p className="mt-1 text-muted-foreground">

                    {
                      filteredServices.length
                    }{" "}
                    services available
                  </p>
                </div>
              </div>

              {/* ERROR */}
              {error && (

                <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-6 text-center text-destructive">

                  Failed to load services
                </div>
              )}

              {/* LOADING */}
              {isLoading && (

                <div className="py-20 text-center text-muted-foreground">

                  Loading services...
                </div>
              )}

              {/* SERVICES GRID */}
             {/* SERVICES GRID */}
<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">

  {paginatedServices.map(
    (service: any) => (

      <Card
        key={service.id}
        className="group rounded-2xl border-border bg-card transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
      >

        <CardContent className="space-y-3 p-3">

          {/* TITLE */}
          <div>

            <h3 className="line-clamp-1 text-sm font-semibold leading-5 text-foreground">

              {service.name}
            </h3>

            {!selectedWindow &&
              service.window_name && (

              <p className="mt-1 text-[11px] text-muted-foreground">

                {
                  service.window_name
                }
              </p>
            )}
          </div>

          {/* DESCRIPTION */}
          <p className="line-clamp-2 text-[11px] leading-5 text-muted-foreground">

            {
              service.description ||
              "Digital government service."
            }
          </p>

          {/* AVAILABILITY */}
          {service.availability &&
            service.availability.length > 0 && (

            <div className="flex flex-wrap gap-1">

              {service.availability
                .slice(0, 2)
                .map(
                  (
                    item: string
                  ) => (

                    <Badge
                      key={item}
                      variant="secondary"
                      className="h-5 rounded-full px-2 text-[10px] capitalize"
                    >
                      {item}
                    </Badge>
                  )
                )}
            </div>
          )}

          {/* ACTION */}
          <Link
            href={`/services/${service.id}`}
          >

            <Button
              variant="outline"
              size="sm"
              className="h-8 w-full rounded-xl text-xs"
            >

              View Details

              <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  )}
</div>

              {/* EMPTY */}
              {!isLoading &&
                paginatedServices.length ===
                  0 && (

                <div className="rounded-3xl border border-dashed border-border bg-card py-20 text-center">

                  <p className="text-muted-foreground">

                    No services found
                  </p>

                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => {

                      setSearch("");

                      setSelectedWindow(
                        null
                      );
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}

              {/* PAGINATION */}
              {totalPages > 1 && (

                <div className="mt-10 flex items-center justify-center gap-2">

                  <Button
                    variant="outline"
                    disabled={page === 1}
                    onClick={() =>
                      setPage(
                        page - 1
                      )
                    }
                  >
                    Previous
                  </Button>

                  {Array.from({
                    length:
                      totalPages,
                  }).map(
                    (_, index) => (

                      <Button
                        key={index}
                        variant={
                          page ===
                          index + 1
                            ? "default"
                            : "outline"
                        }
                        size="icon"
                        onClick={() =>
                          setPage(
                            index + 1
                          )
                        }
                      >
                        {index + 1}
                      </Button>
                    )
                  )}

                  <Button
                    variant="outline"
                    disabled={
                      page ===
                      totalPages
                    }
                    onClick={() =>
                      setPage(
                        page + 1
                      )
                    }
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}