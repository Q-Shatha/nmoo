import { getT } from "@/lib/i18n/server";

export async function LoadingScreen() {
  const t = await getT();

  return (
    <main className="flex min-h-screen items-center justify-center bg-white p-6" aria-label={t.loadingLabel}>
      <img className="h-40 w-40 object-contain sm:h-48 sm:w-48" src="/nmoo-loading.gif" alt={t.loadingLabel} />
    </main>
  );
}
