import { PublicFooter } from "../components/PublicFooter";
import { PublicHeader } from "../components/PublicHeader";
import { CheckoutView } from "./CheckoutView";

type CheckoutPageProps = {
  searchParams?: Promise<{ vendorId?: string }>;
};

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const vendorId = resolvedSearchParams.vendorId?.trim() || undefined;

  return (
    <>
      <PublicHeader active="store" vendorId={vendorId} />
      <main className="app-container pt-8">
        <CheckoutView vendorId={vendorId} />
      </main>
      <PublicFooter />
    </>
  );
}
