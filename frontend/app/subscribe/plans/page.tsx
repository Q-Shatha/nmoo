import { getT } from "@/lib/i18n/server";
import { PublicHeader } from "../../components/PublicHeader";
import { PublicFooter } from "../../components/PublicFooter";
import { PlansClient } from "./PlansClient";

export default async function PlansPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const params = await searchParams;
  const t = await getT();

  return (
    <>
      <PublicHeader hideCart hideLogo />
      <main className="app-container min-h-screen py-16">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h1 className="section-title text-3xl md:text-4xl">{t.landingPricingTitle}</h1>
          <p className="section-copy mt-4 text-lg">{t.landingPricingDesc}</p>
        </div>
        <PlansClient selectedPlan={params.plan ?? "free"} />
      </main>
      <PublicFooter />
    </>
  );
}
