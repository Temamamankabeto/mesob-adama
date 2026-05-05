import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { dashboardConfig, type AppRoleKey } from "@/config/dashboard.config";

const quickActions = [
  "Create user",
  "Assign role",
  "Grant permission",
  "Audit logs",
  "Export report",
  "Service config",
];

const pendingApprovals = [
  { type: "Role change", subject: "Dawit A.", scope: "Subcity Admin", age: "5 min" },
  { type: "User activation", subject: "Mahi K.", scope: "Woreda Back Officer", age: "13 min" },
  { type: "Permission update", subject: "Traffic Service Team", scope: "City Front Officer", age: "31 min" },
  { type: "Location reassignment", subject: "Abel F.", scope: "Subcity Front Officer", age: "47 min" },
];

const systemHealth = [
  { name: "Auth API", status: "Healthy" },
  { name: "User service", status: "Healthy" },
  { name: "Audit pipeline", status: "Degraded" },
  { name: "Queue workers", status: "Healthy" },
];

export default async function RoleDashboardPage({ params }: { params: Promise<{ role: string }> }) {
  const { role } = await params;
  const config = dashboardConfig[role as AppRoleKey];
  if (!config) notFound();
  const Icon = config.icon;

  const isSuperAdmin = config.key === "super-admin";

  return (
    <div className="dashboard-page space-y-6">
      <div className="flex flex-col gap-3 rounded-2xl border bg-card p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Role dashboard</p>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{config.title}</h1>
          <p className="mt-1 text-muted-foreground">{config.subtitle}</p>
        </div>
        <div className="rounded-2xl bg-primary/10 p-4 text-primary"><Icon className="h-8 w-8" /></div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {config.cards.map((card) => (
          <Card key={card.label} className="rounded-2xl">
            <CardHeader className="pb-2">
              <CardDescription>{card.label}</CardDescription>
              <CardTitle className="text-2xl">{card.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {isSuperAdmin ? (
        <>
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="rounded-2xl lg:col-span-2">
              <CardHeader>
                <CardTitle>Super Admin Control Center</CardTitle>
                <CardDescription>Crude full frontend surface for top-level admin operations.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {quickActions.map((action) => (
                  <Button key={action} variant="outline" className="justify-start">{action}</Button>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>Live services overview (placeholder values).</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {systemHealth.map((item) => (
                  <div key={item.name} className="flex items-center justify-between rounded-xl border p-2">
                    <span className="text-sm">{item.name}</span>
                    <Badge variant={item.status === "Healthy" ? "default" : "secondary"}>{item.status}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Pending Approvals Queue</CardTitle>
              <CardDescription>Recent high-privilege actions waiting for decision.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] text-left text-sm">
                  <thead className="border-b text-muted-foreground">
                    <tr>
                      <th className="px-2 py-3 font-medium">Action Type</th>
                      <th className="px-2 py-3 font-medium">Requested By</th>
                      <th className="px-2 py-3 font-medium">Target Scope</th>
                      <th className="px-2 py-3 font-medium">Requested</th>
                      <th className="px-2 py-3 font-medium">Decision</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingApprovals.map((item) => (
                      <tr key={`${item.type}-${item.subject}`} className="border-b last:border-b-0">
                        <td className="px-2 py-3">{item.type}</td>
                        <td className="px-2 py-3">{item.subject}</td>
                        <td className="px-2 py-3">{item.scope}</td>
                        <td className="px-2 py-3 text-muted-foreground">{item.age} ago</td>
                        <td className="px-2 py-3">
                          <div className="flex gap-2">
                            <Button size="sm">Approve</Button>
                            <Button size="sm" variant="destructive">Reject</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Workspace</CardTitle>
            <CardDescription>This role page is ready for feature-specific modules.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex min-h-56 items-center justify-center rounded-2xl border border-dashed bg-muted/30 p-10 text-center text-muted-foreground">{config.roleName} workspace placeholder</div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
