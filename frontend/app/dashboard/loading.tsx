export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-background text-on-surface">
      <header className="border-b border-outline-variant/25 bg-surface-container-lowest px-5 py-4 md:px-8">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4">
          <div className="h-10 w-24 animate-pulse rounded-full bg-surface-container" />
          <div className="h-10 w-36 animate-pulse rounded-full bg-surface-container" />
        </div>
      </header>
      <nav className="border-b border-outline-variant/20 bg-background px-4 py-3">
        <div className="mx-auto flex w-full max-w-7xl gap-2 overflow-hidden">
          {Array.from({ length: 5 }).map((_, index) => (
            <span key={index} className="h-10 w-28 shrink-0 animate-pulse rounded-full bg-surface-container" />
          ))}
        </div>
      </nav>
      <main className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 p-5 md:grid-cols-4 md:p-8">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="dashboard-panel h-36 animate-pulse bg-surface-container" />
        ))}
      </main>
    </div>
  );
}
