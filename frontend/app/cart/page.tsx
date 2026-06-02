import { PublicFooter } from "../components/PublicFooter";
import { PublicHeader } from "../components/PublicHeader";
import { CartView } from "./CartView";

type CartPageProps = {
  searchParams?: Promise<{ vendorId?: string }>;
};

export default async function CartPage({ searchParams }: CartPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const vendorId = resolvedSearchParams.vendorId?.trim() || undefined;

  return (
    <>
      <PublicHeader active="store" vendorId={vendorId} />
      <main className="app-container pt-8">
        <CartView vendorId={vendorId} />
      </main>
      <PublicFooter />
    </>
  );
}
