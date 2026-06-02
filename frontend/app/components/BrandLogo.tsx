import Image from "next/image";
import Link from "next/link";

type BrandLogoProps = {
  href?: string;
  className?: string;
};

export function BrandLogo({ href = "/", className = "" }: BrandLogoProps) {
  return (
    <Link href={href} className={`inline-flex shrink-0 items-center ${className}`} aria-label="شعار nmoo">
      <Image src="/nmoo-logo.png" alt="شعار nmoo" width={96} height={96} className="h-12 w-12 shrink-0 object-contain" priority />
    </Link>
  );
}
