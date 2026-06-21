import { PublicFooter } from "./components/PublicFooter";
import { PublicHeader } from "./components/PublicHeader";
import {
  LandingHero,
  LandingStats,
  LandingHowItWorks,
  LandingDashboardFeatures,
  LandingGlobal,
  LandingUniqueURL,
  LandingPricing,
  LandingCTA,
} from "./components/LandingClient";

export default function Home() {
  return (
    <>
      <PublicHeader active="home" />
      <main className="overflow-hidden pt-8">
        <LandingHero />
        <LandingStats />
        <LandingHowItWorks />
        <LandingDashboardFeatures />
        <LandingGlobal />
        <LandingUniqueURL />
        <LandingPricing />
        <LandingCTA />
      </main>
      <PublicFooter />
    </>
  );
}
