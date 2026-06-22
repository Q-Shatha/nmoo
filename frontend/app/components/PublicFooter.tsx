import Link from "next/link";
import type { ComponentType } from "react";
import { FaEnvelope, FaGlobe, FaInstagram, FaLine, FaSnapchat, FaTelegram, FaTiktok, FaWhatsapp, FaXTwitter, FaYoutube } from "react-icons/fa6";
import { StorePage, VendorTheme } from "@/lib/api";
import { getT } from "@/lib/i18n/server";

type PublicFooterProps = {
  storePages?: StorePage[];
  theme?: Partial<VendorTheme> | null;
};

type FooterLink = {
  label: string;
  href: string;
};

type SocialLink = FooterLink & {
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
};

export async function PublicFooter({ storePages = [], theme }: PublicFooterProps) {
  const t = await getT();
  const socialLinks = getSocialLinks(theme, t);

  return (
    <footer className="mt-16 border-t border-outline-variant/25 bg-surface-container-lowest py-10">
      <div className="app-container grid grid-cols-1 gap-8 text-start md:grid-cols-3">
        <FooterList
          title={t.footerQuickLinks}
          links={[
            { label: t.footerHome, href: "/" },
            { label: t.footerCart, href: "/cart" },
            { label: t.footerOrders, href: "/orders" },
          ]}
          emptyText={t.footerNoLinks}
        />

        <FooterList
          title={t.footerStorePages}
          links={storePages.slice(0, 6).map((page) => ({
            label: page.title,
            href: `/store-pages/${page.id}`,
          }))}
          emptyText={t.footerNoPagesYet}
        />

        <div>
          <h4 className="font-black text-on-surface">{t.footerContactStore}</h4>
          {socialLinks.length > 0 ? (
            <div className="mt-4 flex flex-wrap justify-start gap-2">
              {socialLinks.map((link) => (
                <Link
                  key={link.href}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-outline-variant/35 bg-surface-container-low text-xl text-primary transition hover:border-primary hover:bg-primary hover:text-on-primary"
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={link.label}
                  title={link.label}
                >
                  <link.icon className="h-5 w-5" aria-hidden />
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm leading-7 text-on-surface-variant">{t.footerNoContact}</p>
          )}
        </div>
      </div>

      <p className="app-container mt-8 border-t border-outline-variant/20 pt-6 text-center text-sm text-on-surface-variant">{t.footerCopyright}</p>
    </footer>
  );
}

type T = Awaited<ReturnType<typeof getT>>;

function FooterList({ title, links, emptyText }: { title: string; links: FooterLink[]; emptyText?: string }) {
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
          <span className="text-sm text-on-surface-variant">{emptyText}</span>
        )}
      </nav>
    </div>
  );
}

function getSocialLinks(theme: Partial<VendorTheme> | null | undefined, t: T): SocialLink[] {
  const links: Array<SocialLink | null> = [
    toLink(t.footerSocialWhatsapp, FaWhatsapp, theme?.whatsappUrl),
    toLink(t.footerSocialInstagram, FaInstagram, theme?.instagramUrl),
    toLink(t.footerSocialTiktok, FaTiktok, theme?.tiktokUrl),
    toLink(t.footerSocialLine, FaLine, theme?.lineUrl),
    toLink(t.footerSocialTelegram, FaTelegram, theme?.telegramUrl),
    toLink(t.footerSocialX, FaXTwitter, theme?.xUrl),
    toLink(t.footerSocialSnapchat, FaSnapchat, theme?.snapchatUrl),
    toLink(t.footerSocialYoutube, FaYoutube, theme?.youtubeUrl),
    toLink(t.footerSocialEmail, FaEnvelope, theme?.contactEmail ? `mailto:${theme.contactEmail}` : undefined),
    toLink(t.footerSocialWebsite, FaGlobe, theme?.websiteUrl),
  ];

  return links.filter(Boolean) as SocialLink[];
}

function toLink(label: string, icon: SocialLink["icon"], href?: string | null): SocialLink | null {
  const value = href?.trim();

  if (!value) {
    return null;
  }

  return {
    label,
    icon,
    href: value,
  };
}
