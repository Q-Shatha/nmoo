import Link from "next/link";
import { StorePage } from "@/lib/api";
import { BrandLogo } from "./BrandLogo";

type PublicFooterProps = {
  storePages?: StorePage[];
};

export function PublicFooter({ storePages = [] }: PublicFooterProps) {
  return (
    <footer className="mt-16 border-t border-outline-variant/25 bg-surface-container-lowest py-10">
      <div className="app-container grid grid-cols-1 gap-8 text-right md:grid-cols-4">
        <div>
          <BrandLogo />
          <p className="mt-3 max-w-sm leading-7 text-on-surface-variant">
            منصة عربية تساعد التجار على إطلاق متاجرهم وإدارة المنتجات والطلبات وتجربة البيع من مكان واحد.
          </p>
        </div>

        <FooterList
          title="روابط سريعة"
          links={[
            { label: "الرئيسية", href: "/" },
            { label: "السلة", href: "/cart" },
            { label: "طلباتي", href: "/orders" },
          ]}
        />

        <FooterList
          title="صفحات المتاجر"
          links={storePages.slice(0, 6).map((page) => ({
            label: page.title,
            href: `/store-pages/${page.id}`,
          }))}
          emptyText="لا توجد صفحات منشورة بعد"
        />

        <div>
          <h4 className="font-black text-on-surface">تابع العروض</h4>
          <p className="mt-3 leading-7 text-on-surface-variant">اشترك ليصلك جديد المنتجات والعروض من متاجر nmoo.</p>
          <div className="mt-4 flex gap-2">
            <input className="input-field min-w-0 flex-1 px-3 py-2 text-right" placeholder="البريد الإلكتروني" type="email" />
            <button className="primary-button px-4 py-2">تسجيل</button>
          </div>
        </div>
      </div>

      <p className="app-container mt-8 border-t border-outline-variant/20 pt-6 text-center text-sm text-on-surface-variant">
        © 2026 nmoo نمو. جميع الحقوق محفوظة.
      </p>
    </footer>
  );
}

function FooterList({ title, links, emptyText }: { title: string; links: Array<{ label: string; href: string }>; emptyText?: string }) {
  return (
    <div>
      <h4 className="font-black text-on-surface">{title}</h4>
      <nav className="mt-3 flex flex-col gap-2">
        {links.length > 0 ? (
          links.map((link) => (
            <Link key={`${link.href}-${link.label}`} className="muted-link" href={link.href}>
              {link.label}
            </Link>
          ))
        ) : (
          <span className="text-sm text-on-surface-variant">{emptyText ?? "لا توجد روابط"}</span>
        )}
      </nav>
    </div>
  );
}
