import VendorPage from "../vendors/[vendorId]/page";
import { getVendorByUsername } from "@/lib/api";

type StoreUsernamePageProps = {
  params: Promise<{ storeUsername: string }>;
  searchParams?: Promise<{ q?: string; page?: string }>;
};

export default async function StoreUsernamePage({ params, searchParams }: StoreUsernamePageProps) {
  const { storeUsername } = await params;
  const vendor = await getVendorByUsername(storeUsername);

  return VendorPage({
    params: Promise.resolve({ vendorId: vendor.id }),
    searchParams,
  });
}
