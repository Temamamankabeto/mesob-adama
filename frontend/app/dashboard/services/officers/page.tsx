"use client";

import { useState } from "react";

import Link from "next/link";

import {
  Badge,
} from "@/components/ui/badge";

import {
  Button,
} from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Input,
} from "@/components/ui/input";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import Pagination from "@/components/common/Pagination";

import {
  useServiceOfficers,
} from "@/hooks/services/use-service";

export default function ServiceOfficersPage() {

  /*
  |--------------------------------------------------------------------------
  | STATES
  |--------------------------------------------------------------------------
  */

  const [page,
    setPage] =
    useState(1);

  const [search,
    setSearch] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | FETCH
  |--------------------------------------------------------------------------
  */

  const {
    data,
    isLoading,
  } = useServiceOfficers({

    page,

    search,

    per_page: 10,
  });

  /*
  |--------------------------------------------------------------------------
  | RESPONSE
  |--------------------------------------------------------------------------
  */

  const officers =
    data?.data || [];

  const meta =
    data?.meta;

  return (

    <div className="space-y-6">

      {/* HEADER */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>

          <h1 className="text-2xl font-bold">
            Service Officers
          </h1>

          <p className="text-muted-foreground">
            Manage officer service assignments
          </p>

        </div>

        {/* SEARCH */}

        <Input
          placeholder="Search officers..."
          value={search}
          onChange={(e) => {

            setSearch(
              e.target.value
            );

            setPage(1);
          }}
          className="w-full md:w-[300px]"
        />

      </div>

      {/* CARD */}

      <Card>

        <CardHeader>

          <CardTitle>
            Officers List
          </CardTitle>

        </CardHeader>

        <CardContent>

          {isLoading ? (

            <p>Loading...</p>

          ) : (

            <div className="space-y-4">

              {/* TABLE */}

              <div className="overflow-x-auto">

                <Table>

                  <TableHeader>

                    <TableRow>

                      <TableHead className="text-left">
                        #
                      </TableHead>

                      <TableHead>
                        Name
                      </TableHead>

                      <TableHead>
                        Email
                      </TableHead>

                      <TableHead>
                        Role
                      </TableHead>

                      <TableHead>
                        Assigned Services
                      </TableHead>

                      <TableHead className="text-right">
                        Actions
                      </TableHead>

                    </TableRow>

                  </TableHeader>

                  <TableBody>

                    {officers.length > 0 ? (

                      officers.map(
                        (
                          officer,
                          index
                        ) => (

                          <TableRow
                            key={officer.id}
                          >

                            {/* AUTO INCREMENT */}

                            <TableCell>

                              {meta
                                ? (
                                    (
                                      meta.current_page - 1
                                    ) *
                                      meta.per_page +
                                    index +
                                    1
                                  )
                                : index + 1}

                            </TableCell>

                            {/* NAME */}

                            <TableCell className="font-medium">

                              {officer.name}

                            </TableCell>

                            {/* EMAIL */}

                            <TableCell>

                              {officer.email}

                            </TableCell>

                            {/* ROLE */}

                            <TableCell>

                              <Badge>

                                {officer.roles?.[0]?.name}

                              </Badge>

                            </TableCell>

                            {/* ASSIGNED SERVICES */}

                            <TableCell>

                              <div className="flex flex-wrap gap-2">

                                {officer.assigned_services?.length ? (

                                  officer.assigned_services.map(
                                    (service) => (

                                      <Badge
                                        key={service.id}
                                        variant="secondary"
                                      >
                                        {service.name}
                                      </Badge>
                                    )
                                  )

                                ) : (

                                  <span className="text-sm text-muted-foreground">

                                    No assigned services

                                  </span>

                                )}

                              </div>

                            </TableCell>

                            {/* ACTION */}

                            <TableCell className="text-right">

                              <Link
                                href={`/dashboard/user-services`}
                              >

                                <Button size="sm">

                                  Assign Services

                                </Button>

                              </Link>

                            </TableCell>

                          </TableRow>
                        )
                      )

                    ) : (

                      <TableRow>

                        <TableCell
                          colSpan={6}
                          className="text-center text-muted-foreground"
                        >

                          No officers found

                        </TableCell>

                      </TableRow>

                    )}

                  </TableBody>

                </Table>

              </div>

              {/* PAGINATION */}

              {meta && (

                <Pagination
                  currentPage={
                    meta.current_page
                  }
                  lastPage={
                    meta.last_page
                  }
                  onPageChange={
                    setPage
                  }
                />

              )}

            </div>
          )}

        </CardContent>

      </Card>

    </div>
  );
}