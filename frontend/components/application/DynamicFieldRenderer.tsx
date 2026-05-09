"use client";
                field.name,
                val
              )
            }
          >

            <SelectTrigger>
              <SelectValue placeholder="Select option" />
            </SelectTrigger>

            <SelectContent>

              {field.options?.map(
                (option: string) => (

                  <SelectItem
                    key={option}
                    value={option}
                  >
                    {option}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        </div>
      );

    case "file":
    case "image":
      return (
        <div className="space-y-2">

          <Label>
            {field.label}
          </Label>

          <Input
            type="file"
            onChange={(e) =>
              onChange(
                field.name,
                e.target.files?.[0]
              )
            }
          />
        </div>
      );

    default:
      return (
        <div className="space-y-2">

          <Label>
            {field.label}
          </Label>

          <Input
            type={field.type}
            value={value || ""}
            placeholder={field.placeholder}
            onChange={(e) =>
              onChange(
                field.name,
                e.target.value
              )
            }
          />
        </div>
      );
  }
}