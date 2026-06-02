import { BrandLogo } from "../components/BrandLogo";

export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen bg-background text-on-surface">
      <aside className="fixed right-0 top-0 z-50 hidden h-full w-64 border-l border-inverse-on-surface/15 bg-inverse-surface px-4 py-6 md:block">
        <BrandLogo />
      </aside>
      <main className="min-h-screen flex-1 md:mr-64">
        <header className="border-b border-outline-variant/25 bg-surface-container-lowest px-5 py-4 md:px-8">
          <div className="h-8 w-48 animate-pulse rounded bg-surface-container" />
        </header>
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 p-5 md:grid-cols-4 md:p-8">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="dashboard-panel h-36 animate-pulse bg-surface-container" />
          ))}
        </div>
      </main>
    </div>
  );
}
