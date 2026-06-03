import NewVendorReviewPage from "../../../vendors/[vendorId]/reviews/new/page";
import { getVendorByUsername } from "@/lib/api";

type StoreUsernameReviewPageProps = {
  params: Promise<{ storeUsername: string }>;
};

export default async function StoreUsernameReviewPage({ params }: StoreUsernameReviewPageProps) {
  const { storeUsername } = await params;
  const vendor = await getVendorByUsername(storeUsername);

  return NewVendorReviewPage({
    params: Promise.resolve({ vendorId: vendor.id }),
  });
}
