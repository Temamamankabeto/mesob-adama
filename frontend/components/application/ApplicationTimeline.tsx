interface Props {
  histories: any[];
}

export default function ApplicationTimeline({
  histories,
}: Props) {

  return (
    <div className="space-y-5">

      {histories?.map(
        (history) => (

          <div
            key={history.id}
            className="flex gap-4"
          >

            <div className="mt-1 h-3 w-3 rounded-full bg-primary" />

            <div>

              <p className="font-semibold capitalize">
                {history.action}
              </p>

              <p className="text-sm text-muted-foreground">
                {history.remark}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                {new Date(
                  history.created_at
                ).toLocaleString()}
              </p>
            </div>
          </div>
        )
      )}
    </div>
  );
}