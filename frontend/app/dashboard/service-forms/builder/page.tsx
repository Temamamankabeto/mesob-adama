"use client";

        <Card className="rounded-3xl">

          <CardContent className="p-5 space-y-3">

            <h2 className="font-bold">
              Field Types
            </h2>

            {FIELD_TYPES.map(
              (type) => (

                <Button
                  key={type}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() =>
                    addField(type)
                  }
                >
                  {type}
                </Button>
              )
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">

          {fields.map(
            (field) => (

              <Card
                key={field.id}
                className="rounded-3xl"
              >

                <CardContent className="space-y-4 p-5">

                  <Input
                    value={field.label}
                    onChange={(e) =>
                      setFields(
                        fields.map((f) =>
                          f.id === field.id
                            ? {
                                ...f,
                                label:
                                  e.target.value,
                              }
                            : f
                        )
                      )
                    }
                  />

                  <p className="text-sm text-muted-foreground capitalize">
                    Type: {field.type}
                  </p>
                </CardContent>
              </Card>
            )
          )}
        </div>
      </div>
    </div>
  );
}