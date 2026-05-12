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

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>

          <h1 className="text-2xl font-bold">
            Service Officers
          </h1>

          <p className="text-muted-foreground">
            Manage officer service assignments
          </p>

        </div>

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

              <div className="overflow-x-auto">

                <Table>

                  <TableHeader>

                    <TableRow>

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
                        (officer) => (

                          <TableRow
                            key={officer.id}
                          >

                            <TableCell className="font-medium">

                              {officer.name}

                            </TableCell>

                            <TableCell>

                              {officer.email}

                            </TableCell>

                            <TableCell>

                              <Badge>

                                {officer.roles?.[0]?.name}

                              </Badge>

                            </TableCell>

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
                          colSpan={5}
                          className="text-center text-muted-foreground"
                        >

                          No officers found

                        </TableCell>

                      </TableRow>

                    )}

                  </TableBody>

                </Table>

              </div>

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