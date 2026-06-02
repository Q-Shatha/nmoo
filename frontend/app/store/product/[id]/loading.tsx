import { PublicFooter } from "../../../components/PublicFooter";
import { PublicHeader } from "../../../components/PublicHeader";

export default function ProductLoading() {
  return (
    <>
      <PublicHeader active="store" />
      <main className="app-container pt-8">
        <div className="mb-8 h-5 w-72 animate-pulse rounded bg-surface-container" />
        <section className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div className="order-2 space-y-5 text-right lg:order-1">
            <div className="ms-auto h-10 w-28 animate-pulse rounded-full bg-surface-container" />
            <div className="ms-auto h-14 w-4/5 animate-pulse rounded bg-surface-container" />
            <div className="ms-auto h-8 w-48 animate-pulse rounded bg-surface-container" />
            <div className="ms-auto h-28 w-full animate-pulse rounded bg-surface-container" />
            <div className="ms-auto h-14 w-full animate-pulse rounded bg-surface-container" />
          </div>
          <div className="order-1 lg:order-2">
            <div className="panel aspect-[3/4] animate-pulse bg-surface-container" />
            <div className="mt-4 grid grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="aspect-square animate-pulse rounded-xl bg-surface-container" />
              ))}
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
