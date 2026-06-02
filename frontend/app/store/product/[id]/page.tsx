import { notFound, redirect } from "next/navigation";
import { ApiError, getProductById } from "@/lib/api";

type LegacyProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function LegacyProductPage({ params }: LegacyProductPageProps) {
  const { id } = await params;

  try {
    const product = await getProductById(id);
    redirect(`/vendors/${product.vendorId}/products/${product.id}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    throw error;
  }
}
