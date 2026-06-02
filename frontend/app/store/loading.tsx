import { PublicFooter } from "../components/PublicFooter";
import { PublicHeader } from "../components/PublicHeader";

export default function StoreLoading() {
  return (
    <>
      <PublicHeader active="store" />
      <main className="app-container pt-8">
        <section className="mb-16 h-[360px] animate-pulse rounded-2xl bg-surface-container md:h-[470px]" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="panel p-2">
              <div className="aspect-square animate-pulse rounded-xl bg-surface-container" />
              <div className="space-y-3 p-3">
                <div className="h-4 w-24 animate-pulse rounded bg-surface-container" />
                <div className="h-6 w-full animate-pulse rounded bg-surface-container" />
                <div className="h-6 w-28 animate-pulse rounded bg-surface-container" />
              </div>
            </div>
          ))}
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
