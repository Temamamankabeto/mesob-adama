"use client";

import { useMemo, useState } from "react";
import { BarChart3, CheckCircle2, Clock3, FileText, Loader2, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useReportingDashboard } from "@/hooks/dashboard/use-reporting-dashboard";

type Profile = {
  role_label?: string | null;
  scope_label?: string | null;
};

const navy = "bg-[#111f36] text-white";
const border = "border border-slate-900/80";

function percent(value: number) {
  return `${Number(value || 0).toFixed(0)}%`;
}

function label(option: any) {
  return option?.label ?? option?.name ?? String(option ?? "");
}

function value(option: any) {
  return option?.value ?? option?.id ?? "";
}

function DashboardSelect({
  value: selectedValue,
  onChange,
  options,
  placeholder,
  disabled = false,
}: {
  value?: string;
  onChange: (value: string) => void;
  options: any[];
  placeholder: string;
  disabled?: boolean;
}) {
  return (
    <select
      value={selectedValue ?? ""}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      className="h-9 w-full rounded-md border bg-background px-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={String(value(option))} value={String(value(option))}>
          {label(option)}
        </option>
      ))}
    </select>
  );
}

function SummaryCards({ summary }: { summary: any }) {
  const cards = [
    { title: "Total Applications", value: summary.total_applications, icon: FileText },
    { title: "Approved Applications", value: summary.approved_applications, icon: CheckCircle2 },
    { title: "Rejected Applications", value: summary.rejected_applications, icon: XCircle },
    { title: "Applications in Progress", value: summary.in_progress_applications, icon: Clock3 },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <Card key={card.title}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="rounded-xl bg-primary/10 p-3 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{card.title}</p>
                <p className="text-3xl font-bold">{Number(card.value || 0)}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}

function ExcelFilters({ data, filters, setFilters, mode }: any) {
  const hasWindow = Boolean(filters.window_id);
  const hasService = Boolean(filters.service_id);

  return (
    <div className="overflow-x-auto">
      <table className="w-[760px] border-collapse text-sm">
        <tbody>
          <tr>
            <td className={`${border} px-2 py-2 text-center font-bold`}>Center</td>
            <td className={`${border} px-2 py-2 text-center font-bold`}>Time</td>
            <td className={`${border} px-2 py-2 text-center font-bold`}>Window</td>
            <td className={`${border} px-2 py-2 text-center font-bold`}>Service</td>
            <td className={`${border} px-2 py-2 text-center font-bold`}>Officer</td>
          </tr>
          <tr>
            <td className={`${border} px-1 py-1`}>
              <DashboardSelect
                value={filters.administrative_level}
                onChange={(administrative_level) =>
                  setFilters((current: any) => ({
                    ...current,
                    administrative_level,
                    window_id: "",
                    service_id: "",
                    officer_id: "",
                  }))
                }
                options={(data.filters.levels ?? []).filter((item: any) => value(item) !== "")}
                placeholder="All"
              />
            </td>
            <td className={`${border} px-1 py-1`}>
              <DashboardSelect
                value={filters.time}
                onChange={(time) => setFilters((current: any) => ({ ...current, time }))}
                options={(data.filters.times ?? []).filter((item: any) => value(item) !== "")}
                placeholder={mode === "feedback" ? "To Date" : "All"}
              />
            </td>
            <td className={`${border} px-1 py-1`}>
              <DashboardSelect
                value={filters.window_id}
                onChange={(window_id) =>
                  setFilters((current: any) => ({
                    ...current,
                    window_id,
                    service_id: "",
                    officer_id: "",
                  }))
                }
                options={data.filters.windows ?? []}
                placeholder="All Window"
              />
            </td>
            <td className={`${border} px-1 py-1`}>
              <DashboardSelect
                value={filters.service_id}
                onChange={(service_id) =>
                  setFilters((current: any) => ({
                    ...current,
                    service_id,
                    officer_id: "",
                  }))
                }
                options={data.filters.services ?? []}
                placeholder={hasWindow ? "All Service" : "Select window first"}
                disabled={!hasWindow}
              />
            </td>
            <td className={`${border} px-1 py-1`}>
              <DashboardSelect
                value={filters.officer_id}
                onChange={(officer_id) => setFilters((current: any) => ({ ...current, officer_id }))}
                options={data.filters.officers ?? []}
                placeholder={hasWindow ? (hasService ? "All Officer" : "Select service or all window") : "Select window first"}
                disabled={!hasWindow}
              />
            </td>
          </tr>
          {filters.time === "custom" ? (
            <tr>
              <td className="py-2 text-center" colSpan={5}>
                <div className="flex justify-center gap-2">
                  <input
                    type="date"
                    value={filters.from_date}
                    onChange={(event) => setFilters((current: any) => ({ ...current, from_date: event.target.value }))}
                    className="h-9 rounded-md border bg-background px-2 text-sm"
                  />
                  <input
                    type="date"
                    value={filters.to_date}
                    onChange={(event) => setFilters((current: any) => ({ ...current, to_date: event.target.value }))}
                    className="h-9 rounded-md border bg-background px-2 text-sm"
                  />
                </div>
              </td>
            </tr>
          ) : (
            <tr>
              <td className="py-2 text-center" colSpan={5}>Custom</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function EmptyTableMessage({ colSpan }: { colSpan: number }) {
  return (
    <tr>
      <td className={`${border} px-4 py-10 text-center text-muted-foreground`} colSpan={colSpan}>
        Select a filter to display report data.
      </td>
    </tr>
  );
}

function ApplicationReportTable({ rows, requiresFilter }: { rows: any[]; requiresFilter?: boolean }) {
  const totals = rows.reduce(
    (acc, row) => ({
      total: acc.total + Number(row.total || 0),
      approved_rejected: acc.approved_rejected + Number(row.approved_rejected || 0),
      on_progress: acc.on_progress + Number(row.on_progress || 0),
    }),
    { total: 0, approved_rejected: 0, on_progress: 0 }
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[960px] border-collapse text-sm">
        <thead>
          <tr>
            <th className={`${navy} ${border} px-3 py-2 align-middle`} rowSpan={2}>Window</th>
            <th className={`${navy} ${border} px-3 py-2 align-middle`} rowSpan={2}>Service</th>
            <th className={`${navy} ${border} px-3 py-2 align-middle`} rowSpan={2}>Officer</th>
            <th className={`${navy} ${border} px-3 py-1 text-center`} colSpan={4}>Service</th>
          </tr>
          <tr>
            <th className={`${navy} ${border} px-3 py-2`}>Total</th>
            <th className={`${navy} ${border} px-3 py-2`}>Approved & rejected</th>
            <th className={`${navy} ${border} px-3 py-2`}>Appointed & accepted(on progress)</th>
            <th className={`${navy} ${border} px-3 py-2`}>%</th>
          </tr>
        </thead>
        <tbody>
          {requiresFilter || rows.length === 0 ? (
            <EmptyTableMessage colSpan={7} />
          ) : (
            rows.map((row, index) => (
              <tr key={`${row.window}-${row.service}-${row.officer}-${index}`}>
                <td className={`${border} px-2 py-2`}>{row.window}</td>
                <td className={`${border} px-2 py-2`}>{row.service}</td>
                <td className={`${border} px-2 py-2`}>{row.officer}</td>
                <td className={`${border} px-2 py-2 text-center`}>{row.total}</td>
                <td className={`${border} px-2 py-2 text-center`}>{row.approved_rejected}</td>
                <td className={`${border} px-2 py-2 text-center`}>{row.on_progress}</td>
                <td className={`${border} px-2 py-2 text-center`}>{percent(row.percent)}</td>
              </tr>
            ))
          )}
          {!requiresFilter && rows.length > 0 ? (
            <tr className="font-bold">
              <td className={`${border} px-2 py-2 text-center`} colSpan={3}>Total</td>
              <td className={`${border} px-2 py-2 text-center`}>{totals.total}</td>
              <td className={`${border} px-2 py-2 text-center`}>{totals.approved_rejected}</td>
              <td className={`${border} px-2 py-2 text-center`}>{totals.on_progress}</td>
              <td className={`${border} px-2 py-2 text-center`}>{totals.total ? percent((totals.approved_rejected / totals.total) * 100) : "0%"}</td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}

function FeedbackReportTable({ rows, requiresFilter }: { rows: any[]; requiresFilter?: boolean }) {
  const totals = rows.reduce(
    (acc, row) => ({
      high: acc.high + Number(row.highly_satisfied || 0),
      satisfied: acc.satisfied + Number(row.satisfied || 0),
      notSatisfied: acc.notSatisfied + Number(row.not_satisfied || 0),
      total: acc.total + Number(row.total || 0),
    }),
    { high: 0, satisfied: 0, notSatisfied: 0, total: 0 }
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] border-collapse text-sm">
        <thead>
          <tr>
            <th className={`${navy} ${border} px-3 py-2 align-middle`} rowSpan={2}>Window</th>
            <th className={`${navy} ${border} px-3 py-2 align-middle`} rowSpan={2}>Service</th>
            <th className={`${navy} ${border} px-3 py-1 text-center`} colSpan={5}>customer satisfaction scale</th>
          </tr>
          <tr>
            <th className={`${navy} ${border} px-3 py-2`}>Highly Satisfied</th>
            <th className={`${navy} ${border} px-3 py-2`}>Satisfied</th>
            <th className={`${navy} ${border} px-3 py-2`}>Not Satisfied</th>
            <th className={`${navy} ${border} px-3 py-2`}>Total</th>
            <th className={`${navy} ${border} px-3 py-2`}>%</th>
          </tr>
        </thead>
        <tbody>
          {requiresFilter || rows.length === 0 ? (
            <EmptyTableMessage colSpan={7} />
          ) : (
            rows.map((row, index) => (
              <tr key={`${row.window}-${row.service}-${index}`}>
                <td className={`${border} px-2 py-2`}>{row.window}</td>
                <td className={`${border} px-2 py-2`}>{row.service}</td>
                <td className={`${border} px-2 py-2 text-center`}>{row.highly_satisfied}</td>
                <td className={`${border} px-2 py-2 text-center`}>{row.satisfied}</td>
                <td className={`${border} px-2 py-2 text-center`}>{row.not_satisfied}</td>
                <td className={`${border} px-2 py-2 text-center`}>{row.total}</td>
                <td className={`${border} px-2 py-2 text-center`}>{percent(row.percent)}</td>
              </tr>
            ))
          )}
          {!requiresFilter && rows.length > 0 ? (
            <tr className="font-bold">
              <td className={`${border} px-2 py-2 text-center`} colSpan={2}>Total</td>
              <td className={`${border} px-2 py-2 text-center`}>{totals.high}</td>
              <td className={`${border} px-2 py-2 text-center`}>{totals.satisfied}</td>
              <td className={`${border} px-2 py-2 text-center`}>{totals.notSatisfied}</td>
              <td className={`${border} px-2 py-2 text-center`}>{totals.total}</td>
              <td className={`${border} px-2 py-2 text-center`}>
                {totals.total ? percent(((totals.high + totals.satisfied) / totals.total) * 100) : "0%"}
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}

export default function RoleBasedDashboard({ profile }: { profile?: Profile }) {
  const [filters, setFilters] = useState<any>({
    administrative_level: "",
    time: "",
    window_id: "",
    service_id: "",
    officer_id: "",
    from_date: "",
    to_date: "",
  });

  const params = useMemo(() => {
    const clean: Record<string, string> = {};

    Object.entries(filters).forEach(([key, currentValue]) => {
      if (currentValue) clean[key] = String(currentValue);
    });

    return clean;
  }, [filters]);

  const { data, isLoading, error } = useReportingDashboard(params);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !data) {
    return <div className="rounded-2xl border bg-card p-6 text-sm text-destructive">Failed to load reporting dashboard.</div>;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-primary/10 p-2 text-primary"><BarChart3 className="h-5 w-5" /></div>
              <h1 className="text-2xl font-bold">Report Dashboard</h1>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {data.scope.label || profile?.scope_label || "Role-based application and feedback report"}
            </p>
          </div>
          <Badge variant="secondary">{profile?.role_label || data.scope.role}</Badge>
        </div>
      </section>

      <SummaryCards summary={data.summary} />

      <Tabs defaultValue="report" className="space-y-4">
        <TabsList>
          <TabsTrigger value="report">Report</TabsTrigger>
          <TabsTrigger value="feedback">Feed Back</TabsTrigger>
        </TabsList>

        <TabsContent value="report">
          <Card>
            <CardContent className="p-5">
              <div className="mb-6 text-center text-base font-bold">Report Dashboard</div>
              <ExcelFilters data={data} filters={filters} setFilters={setFilters} mode="report" />
              <div className="h-12" />
              <ApplicationReportTable rows={data.report ?? []} requiresFilter={data.requires_filter} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback">
          <Card>
            <CardContent className="p-5">
              <div className="mb-3 text-center text-base font-bold">Report Dashboard</div>
              <div className="mb-4 w-72 border text-sm">
                <div className="border-b px-3 py-1">Service</div>
                <div className="px-3 py-1">Feed Back</div>
              </div>
              <ExcelFilters data={data} filters={filters} setFilters={setFilters} mode="feedback" />
              <div className="h-12" />
              <FeedbackReportTable rows={data.feedback ?? []} requiresFilter={data.requires_filter} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
