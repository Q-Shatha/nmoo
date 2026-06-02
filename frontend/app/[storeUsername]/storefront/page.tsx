import VendorStorefrontPage from "../../vendors/[vendorId]/storefront/page";
import { getVendorByUsername } from "@/lib/api";

type StoreUsernameStorefrontPageProps = {
  params: Promise<{ storeUsername: string }>;
  searchParams?: Promise<{
    q?: string;
    category?: string;
    page?: string;
  }>;
};

export default async function StoreUsernameStorefrontPage({ params, searchParams }: StoreUsernameStorefrontPageProps) {
  const { storeUsername } = await params;
  const vendor = await getVendorByUsername(storeUsername);

  return VendorStorefrontPage({
    params: Promise.resolve({ vendorId: vendor.id }),
    searchParams,
  });
}
