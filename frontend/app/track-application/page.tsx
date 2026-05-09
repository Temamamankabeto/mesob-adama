"use client";
        {application && (

          <div className="grid gap-6 lg:grid-cols-[1fr_350px]">

            <Card className="rounded-3xl">

              <CardContent className="p-8 space-y-6">

                <div>

                  <h2 className="text-2xl font-bold">
                    {
                      application.service.name
                    }
                  </h2>

                  <p className="text-muted-foreground">
                    Tracking Number: {
                      application.tracking_number
                    }
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">

                  <div className="rounded-2xl border p-4">
                    <p className="text-sm text-muted-foreground">
                      Status
                    </p>
                    <h3 className="mt-1 text-lg font-bold capitalize">
                      {application.status}
                    </h3>
                  </div>

                  <div className="rounded-2xl border p-4">
                    <p className="text-sm text-muted-foreground">
                      Current Window
                    </p>
                    <h3 className="mt-1 text-lg font-bold">
                      {
                        application.current_window?.name ||
                        "Completed"
                      }
                    </h3>
                  </div>

                  <div className="rounded-2xl border p-4">
                    <p className="text-sm text-muted-foreground">
                      Submitted
                    </p>
                    <h3 className="mt-1 text-lg font-bold">
                      {new Date(
                        application.submitted_at
                      ).toLocaleDateString()}
                    </h3>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl">

              <CardContent className="p-8">

                <h3 className="mb-5 text-xl font-bold">
                  Timeline
                </h3>

                <ApplicationTimeline
                  histories={
                    application.histories
                  }
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}