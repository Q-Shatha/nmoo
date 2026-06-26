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
  LandingSupportStory,
} from "./components/LandingClient";

export default function Home() {
  return (
    <>
      <PublicHeader active="home" />
      <main className="overflow-hidden pt-8" data-landing>
        <LandingHero />
        <LandingStats />
        <LandingHowItWorks />
        <LandingDashboardFeatures />
        <LandingGlobal />
        <LandingUniqueURL />
        <LandingPricing />
        <LandingCTA />
        <LandingSupportStory />
      </main>
      <PublicFooter />
    </>
  );
}
