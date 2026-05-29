"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  CalendarClock,
  ChevronRight,
  CreditCard,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

import { authService, type AuthUser } from "@/services/auth/auth.service";
import {
  customerNotificationService,
  type CustomerNotificationItem,
} from "@/services/customer/customer-notification.service";
import { getDashboardForRole } from "@/config/dashboard.config";
import SidebarContent from "@/layouts/components/SidebarContent";

const CUSTOMER_ROLES = new Set(["customer", "citizen"]);

type DashboardHeaderProps = {
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
};

function initials(name?: string | null) {
  return (
    (name || "User")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U"
  );
}

function notificationIcon(type: CustomerNotificationItem["type"]) {
  if (type === "payment") {
    return <CreditCard className="h-4 w-4 text-emerald-600" />;
  }

  return <CalendarClock className="h-4 w-4 text-blue-600" />;
}

export default function DashboardHeader({
  sidebarCollapsed = false,
  onToggleSidebar,
}: DashboardHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<AuthUser | null>(null);

  const [notifications, setNotifications] = useState<
    CustomerNotificationItem[]
  >([]);

  const [appointmentCount, setAppointmentCount] = useState(0);
  const [paymentCount, setPaymentCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  useEffect(() => {
    setUser(authService.getStoredUser());
  }, [pathname]);

  const role =
    authService.getStoredRoles()[0] ??
    user?.role ??
    "Customer";

  const dashboard = getDashboardForRole(role);

  const isCustomer = useMemo(() => {
    return CUSTOMER_ROLES.has(String(role).toLowerCase());
  }, [role]);

  useEffect(() => {
    if (!isCustomer) return;

    let mounted = true;

    async function loadNotifications() {
      setLoadingNotifications(true);

      try {
        const data = await customerNotificationService.list();

        if (!mounted) return;

        setNotifications(data.notifications ?? []);
        setAppointmentCount(data.appointment_count ?? 0);
        setPaymentCount(data.payment_count ?? 0);
        setNotificationCount(data.unread_count ?? 0);
      } catch {
        if (!mounted) return;

        setNotifications([]);
        setAppointmentCount(0);
        setPaymentCount(0);
        setNotificationCount(0);
      } finally {
        if (mounted) {
          setLoadingNotifications(false);
        }
      }
    }

    loadNotifications();

    return () => {
      mounted = false;
    };
  }, [isCustomer, pathname]);

  async function logout() {
    await authService.logout();

    toast.success("Logged out successfully");

    router.replace("/login");
  }

  function openNotification(item: CustomerNotificationItem) {
    router.push(
      item.href || `/dashboard/my-applications/${item.application_id}`
    );
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-3">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="md:hidden"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>

          <SheetContent side="left" className="w-72 p-0">
            <SidebarContent />
          </SheetContent>
        </Sheet>

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="hidden md:inline-flex"
          onClick={onToggleSidebar}
          aria-label={
            sidebarCollapsed
              ? "Expand sidebar"
              : "Collapse sidebar"
          }
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </Button>

        <div>
          <p className="text-xs text-muted-foreground">
            Current workspace
          </p>

          <h2 className="text-sm font-semibold md:text-base">
            {dashboard.roleName}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {isCustomer && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="relative rounded-full"
              >
                <Bell className="h-4 w-4" />

                {notificationCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                    {notificationCount > 99
                      ? "99+"
                      : notificationCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-[360px] p-0"
            >
              <DropdownMenuLabel className="flex items-center justify-between px-4 py-3">
                <span>Notifications</span>

                <Badge variant="secondary">
                  {notificationCount}
                </Badge>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <div className="grid grid-cols-2 gap-2 px-4 py-3">
                <div className="rounded-xl border bg-blue-50 p-3">
                  <p className="text-xs text-muted-foreground">
                    Appointments
                  </p>

                  <p className="text-xl font-bold text-blue-700">
                    {appointmentCount}
                  </p>
                </div>

                <div className="rounded-xl border bg-emerald-50 p-3">
                  <p className="text-xs text-muted-foreground">
                    Payments
                  </p>

                  <p className="text-xl font-bold text-emerald-700">
                    {paymentCount}
                  </p>
                </div>
              </div>

              <DropdownMenuSeparator />

              <ScrollArea className="max-h-80">
                {loadingNotifications ? (
                  <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                    Loading notifications...
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                    No appointment or payment messages.
                  </div>
                ) : (
                  notifications.map((item) => (
                    <DropdownMenuItem
                      key={item.id}
                      className="cursor-pointer gap-3 px-4 py-3"
                      onClick={() => openNotification(item)}
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                        {notificationIcon(item.type)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">
                          {item.title}
                        </p>

                        <p className="line-clamp-2 text-xs text-muted-foreground">
                          {item.message}
                        </p>

                        <p className="mt-1 text-[11px] text-muted-foreground">
                          {item.tracking_number}
                        </p>
                      </div>

                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </DropdownMenuItem>
                  ))
                )}
              </ScrollArea>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <Avatar className="h-10 w-10 border">
          <AvatarImage
            src={(user as any)?.profile_image_url ?? undefined}
            alt={user?.name ?? "User"}
          />

          <AvatarFallback>
            {initials(user?.name ?? user?.email)}
          </AvatarFallback>
        </Avatar>

        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold">
            {user?.name ?? "User"}
          </p>

          <p className="max-w-[180px] truncate text-xs text-muted-foreground">
            {user?.email ?? dashboard.roleName}
          </p>
        </div>

        <Button
          variant="outline"
          onClick={logout}
          className="hidden sm:inline-flex"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </header>
  );
}