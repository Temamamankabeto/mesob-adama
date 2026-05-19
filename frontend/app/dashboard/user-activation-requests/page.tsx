"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Search, XCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  useApproveActivationRequest,
  useBulkApproveActivationRequests,
  useBulkVerifyActivationRequests,
  useRejectActivationRequest,
  useUserActivationRequests,
  useVerifyActivationRequest,
} from "@/hooks/user/useUserActivationRequests";
import { authService } from "@/services/auth/auth.service";
import { locationLevelLabel, normalizeRoleName, roleLabel } from "@/config/roles.config";

function actorLocationLevel(user: any) {
  if (user?.woreda_id) return "woreda";
  if (user?.subcity_id) return "subcity";
  if (user?.city_id) return "city";
  return user?.location_level || "";
}

function requestRoleName(request: any) {
  return (
    request?.user?.role ||
    request?.user?.role_names?.[0] ||
    request?.user?.roles?.[0]?.name ||
    ""
  );
}

function requestLocation(request: any) {
  return (
    request?.user?.woreda?.name ||
    request?.user?.subcity?.name ||
    request?.user?.city?.name ||
    "-"
  );
}

function statusLabel(status: string) {
  return String(status || "-").replaceAll("_", " ");
}

export default function UserActivationRequestsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const { data, isLoading } = useUserActivationRequests({
    page,
    search,
    status,
  });

  const verifyMutation = useVerifyActivationRequest();
  const bulkVerifyMutation = useBulkVerifyActivationRequests();
  const approveMutation = useApproveActivationRequest();
  const bulkApproveMutation = useBulkApproveActivationRequests();
  const rejectMutation = useRejectActivationRequest();

  const authUser = authService.getStoredUser() as any;
  const authRoles = authService.getStoredRoles();
  const authRole = normalizeRoleName(authRoles?.[0] || authUser?.role);
  const actorLevel = actorLocationLevel(authUser);

  const requests = data?.data || [];
  const meta = data?.meta;

  const canVerify = useMemo(() => {
    return authRole === "admin" && actorLevel === "subcity";
  }, [authRole, actorLevel]);

  const canApprove = useMemo(() => {
    return (
      authRole === "super_admin" ||
      (authRole === "admin" && actorLevel === "city")
    );
  }, [authRole, actorLevel]);

  const selectableRequests = useMemo(() => {
    if (canVerify) {
      return requests.filter(
        (item) => item.status === "pending_subcity_verification"
      );
    }

    if (canApprove) {
      return requests.filter(
        (item) => item.status === "pending_city_approval"
      );
    }

    return [];
  }, [requests, canVerify, canApprove]);

  const selectedSelectableIds = selectedIds.filter((id) =>
    selectableRequests.some((item) => item.id === id)
  );

  const allSelected =
    selectableRequests.length > 0 &&
    selectedSelectableIds.length === selectableRequests.length;

  function toggleOne(id: number) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  function toggleAll() {
    if (allSelected) {
      setSelectedIds((current) =>
        current.filter(
          (id) => !selectableRequests.some((item) => item.id === id)
        )
      );

      return;
    }

    setSelectedIds((current) =>
      Array.from(
        new Set([
          ...current,
          ...selectableRequests.map((item) => item.id),
        ])
      )
    );
  }

  async function verify(id: number) {
    await verifyMutation.mutateAsync({
      id,
      note: "Verified by subcity admin.",
    });

    setSelectedIds((current) => current.filter((item) => item !== id));
    toast.success("Request verified and forwarded to city admin.");
  }

  async function bulkVerify() {
    if (!selectedSelectableIds.length) {
      toast.error("Select pending subcity verification requests first.");
      return;
    }

    await bulkVerifyMutation.mutateAsync({
      ids: selectedSelectableIds,
      note: "Bulk verified by subcity admin.",
    });

    setSelectedIds([]);
    toast.success("Selected requests verified and forwarded to city admin.");
  }

  async function approve(id: number) {
    await approveMutation.mutateAsync({
      id,
      note: "Approved by city admin.",
    });

    setSelectedIds((current) => current.filter((item) => item !== id));
    toast.success("Officer activated successfully.");
  }

  async function bulkApprove() {
    if (!selectedSelectableIds.length) {
      toast.error("Select pending city approval requests first.");
      return;
    }

    await bulkApproveMutation.mutateAsync({
      ids: selectedSelectableIds,
      note: "Bulk approved by city admin.",
    });

    setSelectedIds([]);
    toast.success("Selected officers activated successfully.");
  }

  async function reject(id: number) {
    const reason = prompt("Rejection reason");

    if (!reason) return;

    await rejectMutation.mutateAsync({ id, reason });
    setSelectedIds((current) => current.filter((item) => item !== id));
    toast.success("Activation request rejected.");
  }

  function resetSelectionOnFilter() {
    setPage(1);
    setSelectedIds([]);
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-3 sm:p-6">
      <div className="rounded-3xl border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-bold">User Activation Requests</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Woreda-created officers are verified by Subcity Admin, then activated by City Admin.
          Subcity-created officers are activated by City Admin.
        </p>
      </div>

      <Card className="rounded-3xl">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Requests</CardTitle>
            <p className="text-sm text-muted-foreground">
              {meta?.total || 0} request(s)
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row">
            {canVerify && (
              <Button
                onClick={bulkVerify}
                disabled={
                  !selectedSelectableIds.length ||
                  bulkVerifyMutation.isPending
                }
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Verify Selected
              </Button>
            )}

            {canApprove && (
              <Button
                onClick={bulkApprove}
                disabled={
                  !selectedSelectableIds.length ||
                  bulkApproveMutation.isPending
                }
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Activate Selected
              </Button>
            )}

            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                resetSelectionOnFilter();
              }}
              className="rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="">All Status</option>
              <option value="pending_subcity_verification">
                Pending Subcity Verification
              </option>
              <option value="pending_city_approval">
                Pending City Approval
              </option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  resetSelectionOnFilter();
                }}
                placeholder="Search user..."
                className="pl-10 md:w-72"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {selectableRequests.length > 0 && (
            <div className="mb-4 rounded-2xl border bg-muted/40 p-4">
              <label className="flex cursor-pointer items-center gap-3 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                />
                {canVerify
                  ? "Select / deselect all pending subcity verification requests on this page"
                  : "Select / deselect all pending city approval requests on this page"}
              </label>
            </div>
          )}

          <div className="space-y-3">
            {isLoading ? (
              <div className="rounded-2xl border p-8 text-center text-muted-foreground">
                Loading...
              </div>
            ) : requests.length ? (
              requests.map((request) => {
                const canSelect =
                  (canVerify &&
                    request.status === "pending_subcity_verification") ||
                  (canApprove &&
                    request.status === "pending_city_approval");

                return (
                  <div key={request.id} className="rounded-2xl border p-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex gap-3">
                        {canSelect && (
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(request.id)}
                            onChange={() => toggleOne(request.id)}
                            className="mt-1"
                          />
                        )}

                        <div>
                          <h3 className="font-semibold">
                            {request.user?.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {request.user?.email} · {request.user?.phone}
                          </p>

                          <p className="mt-1 text-sm text-muted-foreground">
                            {roleLabel(requestRoleName(request))} ·{" "}
                            {locationLevelLabel(
                              request.user?.location_level ||
                                request.request_level
                            )}
                          </p>

                          <p className="mt-1 text-xs text-muted-foreground">
                            Location: {requestLocation(request)}
                          </p>

                          <p className="mt-1 text-xs text-muted-foreground">
                            Requested by: {request.requester?.name || "-"}
                            {request.verifier?.name
                              ? ` · Verified by: ${request.verifier.name}`
                              : ""}
                            {request.approver?.name
                              ? ` · Approved by: ${request.approver.name}`
                              : ""}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium capitalize">
                          {statusLabel(request.status)}
                        </span>

                        {canVerify &&
                          request.status ===
                            "pending_subcity_verification" && (
                            <Button
                              size="sm"
                              onClick={() => verify(request.id)}
                              disabled={verifyMutation.isPending}
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Verify
                            </Button>
                          )}

                        {canApprove &&
                          request.status === "pending_city_approval" && (
                            <Button
                              size="sm"
                              onClick={() => approve(request.id)}
                              disabled={approveMutation.isPending}
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Approve & Activate
                            </Button>
                          )}

                        {[
                          "pending_subcity_verification",
                          "pending_city_approval",
                        ].includes(request.status) && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => reject(request.id)}
                            disabled={rejectMutation.isPending}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl border p-8 text-center text-muted-foreground">
                No activation requests found.
              </div>
            )}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Page {meta?.current_page || 1} of {meta?.last_page || 1}
            </p>

            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={!meta || meta.current_page <= 1}
                onClick={() => {
                  setSelectedIds([]);
                  setPage((current) => Math.max(1, current - 1));
                }}
              >
                Previous
              </Button>

              <Button
                variant="outline"
                disabled={!meta || meta.current_page >= meta.last_page}
                onClick={() => {
                  setSelectedIds([]);
                  setPage((current) => current + 1);
                }}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
