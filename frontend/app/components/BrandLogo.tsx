import Image from "next/image";
import Link from "next/link";
import { getT } from "@/lib/i18n/server";

type BrandLogoProps = {
  href?: string;
  className?: string;
};

export async function BrandLogo({ href = "/", className = "" }: BrandLogoProps) {
  const t = await getT();
  return (
    <Link href={href} className={`inline-flex shrink-0 items-center ${className}`} aria-label={t.brandLogoLabel}>
      <Image src="/nmoo-logo.png" alt={t.brandLogoLabel} width={96} height={96} className="h-12 w-12 shrink-0 object-contain" priority />
    </Link>
  );
}
