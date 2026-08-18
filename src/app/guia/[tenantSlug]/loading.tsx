export default function PublicGuideLoading() {
  return (
    <main className="min-h-dvh bg-background px-4 py-4">
      <div className="mx-auto max-w-5xl animate-pulse space-y-4">
        <div className="min-h-[72svh] rounded-[28px] bg-muted" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-28 rounded-lg bg-muted" />
          ))}
        </div>
        <div className="space-y-3">
          <div className="h-8 w-40 rounded-md bg-muted" />
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="h-64 rounded-lg bg-muted" />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
