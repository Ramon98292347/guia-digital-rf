export default function AdminAccommodationsLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="space-y-2">
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
        <div className="h-9 w-64 animate-pulse rounded bg-muted" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-40 animate-pulse rounded-lg border border-border bg-muted/50"
          />
        ))}
      </div>
    </div>
  );
}
