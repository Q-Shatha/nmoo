import StoreProductPage from "../../../vendors/[vendorId]/products/[productId]/page";
import { getVendorByUsername } from "@/lib/api";

type StoreUsernameProductPageProps = {
  params: Promise<{
    storeUsername: string;
    productId: string;
  }>;
};

export default async function StoreUsernameProductPage({ params }: StoreUsernameProductPageProps) {
  const { storeUsername, productId } = await params;
  const vendor = await getVendorByUsername(storeUsername);

  return StoreProductPage({
    params: Promise.resolve({
      vendorId: vendor.id,
      productId,
    }),
  });
}
