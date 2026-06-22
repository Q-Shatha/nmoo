"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";
import { ApiError, updateMyTheme, uploadProductImage, VendorTheme } from "@/lib/api";
import { getStoreTemplate, StoreTemplate, storeTemplates, StoreTemplateId } from "@/lib/store-templates";
import { applyThemeTokens } from "@/lib/theme";
import { useI18n } from "@/lib/i18n/context";
import { DashboardAccordion } from "./DashboardAccordion";

type ImageField = "logoUrl" | "bannerUrl" | "storefrontImageUrl";
type SocialField = "whatsappUrl" | "instagramUrl" | "tiktokUrl" | "lineUrl" | "telegramUrl" | "xUrl" | "snapchatUrl" | "youtubeUrl" | "contactEmail" | "websiteUrl";

export function ThemeManager({ initialTheme }: { initialTheme: VendorTheme }) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [primaryColor, setPrimaryColor] = useState(initialTheme.primaryColor);
  const [secondaryColor, setSecondaryColor] = useState(initialTheme.secondaryColor);
  const [textColor, setTextColor] = useState(initialTheme.textColor ?? initialTheme.secondaryColor);
  const [storeName, setStoreName] = useState(initialTheme.storeName ?? "");
  const [logoUrl, setLogoUrl] = useState(initialTheme.logoUrl ?? "");
  const [bannerUrl, setBannerUrl] = useState(initialTheme.bannerUrl ?? "");
  const [storefrontImageUrl, setStorefrontImageUrl] = useState(initialTheme.storefrontImageUrl ?? "");
  const [storefrontTitle, setStorefrontTitle] = useState(initialTheme.storefrontTitle ?? "");
  const [storefrontDescription, setStorefrontDescription] = useState(initialTheme.storefrontDescription ?? "");
  const [templateId, setTemplateId] = useState<StoreTemplateId>(getStoreTemplate(initialTheme.templateId).id);
  const [socialLinks, setSocialLinks] = useState<Record<SocialField, string>>({
    whatsappUrl: initialTheme.whatsappUrl ?? "",
    instagramUrl: initialTheme.instagramUrl ?? "",
    tiktokUrl: initialTheme.tiktokUrl ?? "",
    lineUrl: initialTheme.lineUrl ?? "",
    telegramUrl: initialTheme.telegramUrl ?? "",
    xUrl: initialTheme.xUrl ?? "",
    snapchatUrl: initialTheme.snapchatUrl ?? "",
    youtubeUrl: initialTheme.youtubeUrl ?? "",
    contactEmail: initialTheme.contactEmail ?? "",
    websiteUrl: initialTheme.websiteUrl ?? "",
  });
  const [previewTheme, setPreviewTheme] = useState(initialTheme);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<ImageField | null>(null);

  const imageFields: Array<{
    key: ImageField;
    label: string;
    helper: string;
    ratio: string;
  }> = [
    {
      key: "logoUrl",
      label: t.storeIconLabel,
      helper: t.storeIconHelper,
      ratio: "aspect-square",
    },
    {
      key: "bannerUrl",
      label: t.storeBannerLabel,
      helper: t.storeBannerHelper,
      ratio: "aspect-[16/5]",
    },
    {
      key: "storefrontImageUrl",
      label: t.storeCoverLabel,
      helper: t.storeCoverHelper,
      ratio: "aspect-[4/3]",
    },
  ];

  const socialFields: Array<{
    key: SocialField;
    label: string;
    placeholder: string;
  }> = [
    { key: "whatsappUrl", label: t.whatsappLabel, placeholder: "https://wa.me/9665..." },
    { key: "instagramUrl", label: t.instagramLabel, placeholder: "https://instagram.com/store" },
    { key: "tiktokUrl", label: t.tiktokLabel, placeholder: "https://tiktok.com/@store" },
    { key: "lineUrl", label: t.lineLabel, placeholder: "https://line.me/R/ti/p/@store" },
    { key: "telegramUrl", label: t.telegramLabel, placeholder: "https://t.me/store" },
    { key: "xUrl", label: t.xLabel, placeholder: "https://x.com/store" },
    { key: "snapchatUrl", label: t.snapchatLabel, placeholder: "https://snapchat.com/add/store" },
    { key: "youtubeUrl", label: t.youtubeLabel, placeholder: "https://youtube.com/@store" },
    { key: "contactEmail", label: t.contactEmailLabel, placeholder: "support@example.com" },
    { key: "websiteUrl", label: t.websiteLabel, placeholder: "https://example.com" },
  ];

  const imageState = {
    logoUrl,
    bannerUrl,
    storefrontImageUrl,
  };

  function setImageValue(field: ImageField, value: string) {
    if (field === "logoUrl") {
      setLogoUrl(value);
    } else if (field === "bannerUrl") {
      setBannerUrl(value);
    } else {
      setStorefrontImageUrl(value);
    }
  }

  async function handleImageUpload(field: ImageField, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setMessage("");
    setUploadingField(field);

    try {
      const token = readCookie("nmoo_access_token");
      const uploaded = await uploadProductImage(file, token);
      setImageValue(field, uploaded.url);
      setMessage(t.imageUploadedSaveToApply);
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : t.imageUploadError2);
    } finally {
      setUploadingField(null);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSaving(true);

    try {
      const token = readCookie("nmoo_access_token");
      const theme = await updateMyTheme(
        {
          primaryColor,
          secondaryColor,
          textColor,
          storeName,
          logoUrl,
          bannerUrl,
          storefrontImageUrl,
          storefrontTitle,
          storefrontDescription,
          templateId,
          ...socialLinks,
        },
        token,
      );
      setPreviewTheme(theme);
      applyThemeTokens(theme);
      router.refresh();
      setMessage(t.themeSaved);
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : t.themeSaveError);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section id="theme" className="dashboard-panel overflow-hidden">
      <div className="border-b border-outline-variant/15 p-5 text-start">
        <h4 className="text-xl font-black text-on-surface">{t.themeIdentityTitle}</h4>
        <p className="mt-1 text-sm leading-6 text-on-surface-variant">{t.themeIdentityDesc}</p>
      </div>

      <form className="grid gap-5 p-5 text-start lg:grid-cols-[1fr_360px]" onSubmit={handleSubmit}>
        <div className="grid gap-5">
          <label className="grid gap-2 rounded-2xl border border-outline-variant/25 bg-surface-container-lowest p-4">
            <span className="text-sm font-bold text-on-surface">{t.storeName}</span>
            <input
              className="input-field px-4 py-3 text-start"
              maxLength={70}
              placeholder={t.storeNamePlaceholderTheme}
              value={storeName}
              onChange={(event) => setStoreName(event.target.value)}
            />
            <span className="text-xs font-bold leading-5 text-on-surface-variant">{t.storeNameHelperTheme}</span>
          </label>

          <div className="grid gap-4 md:grid-cols-3">
            <ColorField label={t.primaryColorLabel} value={primaryColor} onChange={setPrimaryColor} />
            <ColorField label={t.secondaryColorLabel} value={secondaryColor} onChange={setSecondaryColor} />
            <ColorField label={t.textColorLabel} value={textColor} onChange={setTextColor} />
          </div>

          <DashboardAccordion title={t.templateAccordionTitle} description={t.templateAccordionDesc} defaultOpen>
            <TemplateSelector primaryColor={primaryColor} secondaryColor={secondaryColor} textColor={textColor} selectedTemplateId={templateId} onChange={setTemplateId} templateSelected={t.templateSelected} templateSelectorDesc={t.templateSelectorDesc} locale={locale} />
          </DashboardAccordion>

          <DashboardAccordion title={t.storefrontTextAccordionTitle} description={t.storefrontTextAccordionDesc}>
            <div className="grid gap-4">
              <label className="grid gap-2">
                <span className="text-sm font-bold text-on-surface">{t.storefrontTitleLabel}</span>
                <input
                  className="input-field px-4 py-3 text-start"
                  maxLength={80}
                  placeholder={t.storefrontTitlePlaceholder}
                  value={storefrontTitle}
                  onChange={(event) => setStorefrontTitle(event.target.value)}
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-bold text-on-surface">{t.storefrontDescLabel}</span>
                <textarea
                  className="input-field min-h-28 resize-y px-4 py-3 text-start leading-8"
                  maxLength={220}
                  placeholder={t.storefrontDescPlaceholder}
                  value={storefrontDescription}
                  onChange={(event) => setStorefrontDescription(event.target.value)}
                />
              </label>
            </div>
          </DashboardAccordion>

          <DashboardAccordion title={t.socialLinksAccordionTitle} description={t.socialLinksAccordionDesc}>
            <div className="grid gap-3 md:grid-cols-2">
              {socialFields.map((field) => (
                <label key={field.key} className="grid gap-2">
                  <span className="text-sm font-bold text-on-surface">{field.label}</span>
                  <input
                    className="input-field px-4 py-3 text-left"
                    dir="ltr"
                    placeholder={field.placeholder}
                    type={field.key === "contactEmail" ? "email" : "url"}
                    value={socialLinks[field.key]}
                    onChange={(event) =>
                      setSocialLinks((current) => ({
                        ...current,
                        [field.key]: event.target.value,
                      }))
                    }
                  />
                </label>
              ))}
            </div>
          </DashboardAccordion>

          <DashboardAccordion title={t.storeImagesAccordionTitle} description={t.storeImagesAccordionDesc}>
            <div className="grid gap-4">
              {imageFields.map((field) => (
                <ImageUploadField
                  key={field.key}
                  field={field.key}
                  helper={field.helper}
                  label={field.label}
                  ratio={field.ratio}
                  uploading={uploadingField === field.key}
                  value={imageState[field.key]}
                  noImageText={t.noImageYet}
                  imageUrlOrUploadPlaceholder={t.imageUrlOrUploadPlaceholder}
                  uploadingText={t.uploading}
                  uploadImageText={t.uploadImageButton}
                  deleteImageText={t.deleteImage}
                  onChange={setImageValue}
                  onUpload={handleImageUpload}
                />
              ))}
            </div>
          </DashboardAccordion>

          {message ? <p className="rounded-xl bg-surface-container-low px-4 py-3 text-sm font-bold text-on-surface">{message}</p> : null}

          <button className="primary-button w-fit px-8 py-3 disabled:opacity-60" disabled={isSaving || uploadingField !== null} type="submit">
            {isSaving ? t.saving : t.saveThemeButton}
          </button>
        </div>

        <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-4">
          <p className="text-sm font-bold text-on-surface-variant">{t.themePreviewLabel}</p>
          <div className="mt-4 overflow-hidden rounded-2xl border border-outline-variant/25 bg-surface-container-lowest">
            <div className="relative aspect-[16/7] bg-surface-container">
              {previewTheme.bannerUrl || bannerUrl ? <Image alt={t.bannerPreviewAlt} className="object-cover" src={previewTheme.bannerUrl || bannerUrl} fill sizes="360px" unoptimized /> : null}
            </div>
            <div className="-mt-8 px-4 pb-4">
              <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-white shadow-lg">
                {previewTheme.logoUrl || logoUrl ? <Image alt={t.iconPreviewAlt} className="object-contain p-1" src={previewTheme.logoUrl || logoUrl} fill sizes="64px" unoptimized /> : <span className="text-sm font-black text-primary">nmoo</span>}
              </div>
              <div className="mt-4 grid gap-3">
                <PreviewBlock background={previewTheme.tokens.primary} color={previewTheme.tokens.onPrimary} label={t.primaryButtonPreviewLabel} subLabel={t.previewTextClear} />
                <PreviewBlock background={previewTheme.tokens.secondary} color={previewTheme.tokens.onSecondary} label={t.secondaryButtonPreviewLabel} subLabel={t.previewTextClear} />
                <PreviewBlock background="#ffffff" color={previewTheme.textColor ?? textColor} label={t.textColorLabel} subLabel={t.previewTextClear} />
              </div>
            </div>
          </div>
        </div>
      </form>
    </section>
  );
}

function TemplateSelector({
  primaryColor,
  secondaryColor,
  textColor,
  selectedTemplateId,
  onChange,
  templateSelected,
  templateSelectorDesc,
  locale,
}: {
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  selectedTemplateId: StoreTemplateId;
  onChange: (value: StoreTemplateId) => void;
  templateSelected: string;
  templateSelectorDesc: string;
  locale: string;
}) {
  return (
    <section className="grid gap-4 rounded-2xl border border-outline-variant/25 bg-surface-container-lowest p-4">
      <div>
        <h5 className="font-black text-on-surface">
          {/* title shown via DashboardAccordion above */}
        </h5>
        <p className="mt-1 text-sm leading-6 text-on-surface-variant">{templateSelectorDesc}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {storeTemplates.map((template) => (
          <TemplateOption
            key={template.id}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            textColor={textColor}
            selected={selectedTemplateId === template.id}
            template={template}
            onChange={onChange}
            templateSelected={templateSelected}
            locale={locale}
          />
        ))}
      </div>
    </section>
  );
}

function TemplateOption({
  primaryColor,
  secondaryColor,
  textColor,
  selected,
  template,
  onChange,
  templateSelected,
  locale,
}: {
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  selected: boolean;
  template: StoreTemplate;
  onChange: (value: StoreTemplateId) => void;
  templateSelected: string;
  locale: string;
}) {
  return (
    <label
      className={`template-option-card group cursor-pointer overflow-hidden rounded-[1.6rem] border bg-white text-start transition duration-300 ${
        selected
          ? "is-selected border-primary shadow-[0_18px_42px_rgba(23,28,31,0.12)] ring-2 ring-primary-container"
          : "border-outline-variant/25 hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_14px_34px_rgba(23,28,31,0.10)]"
      }`}
      onClick={() => onChange(template.id)}
    >
      <input checked={selected} className="sr-only" name="store-template" type="radio" value={template.id} onChange={() => onChange(template.id)} />
      <TemplatePreview primaryColor={primaryColor} secondaryColor={secondaryColor} textColor={textColor} templateId={template.id} />
      <div className="grid gap-2 p-5">
        <span className="text-base font-black text-on-surface">{locale === "en" ? template.nameEn : template.name}</span>
        <span className="text-sm leading-6 text-on-surface-variant">{locale === "en" ? template.descriptionEn : template.description}</span>
        <span className="mt-2 w-fit rounded-full px-3 py-1 text-xs font-black" style={{ backgroundColor: primaryColor, color: readablePreviewText(primaryColor) }}>
          {selected ? templateSelected : (locale === "en" ? template.previewToneEn : template.previewTone)}
        </span>
      </div>
    </label>
  );
}

function TemplatePreview({ primaryColor, secondaryColor, textColor, templateId }: { primaryColor: string; secondaryColor: string; textColor: string; templateId: StoreTemplateId }) {
  const isBoutique = templateId === "boutique";
  const isGallery = templateId === "gallery";
  const isMinimal = templateId === "minimal";
  const isMarket = templateId === "market";
  const heroBg = isGallery ? secondaryColor : primaryColor;
  const heroText = readablePreviewText(heroBg);
  const productCount = isGallery ? 5 : isBoutique ? 3 : isMarket ? 4 : 3;

  return (
    <div className="template-store-preview relative h-52 overflow-hidden border-b border-outline-variant/20 bg-[linear-gradient(135deg,#fff_0%,#f8f4f6_100%)] p-3">
      <div
        className={`template-store-screen h-full overflow-hidden border border-outline-variant/15 bg-white shadow-sm ${
          isBoutique ? "rounded-[2rem]" : isGallery ? "rounded-lg" : isMinimal ? "rounded-3xl" : "rounded-2xl"
        }`}
      >
        <div className="template-preview-nav flex h-9 items-center justify-between px-3" style={{ backgroundColor: isMinimal ? "#ffffff" : heroBg }}>
          <div className="flex items-center gap-1.5">
            <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: isMinimal ? primaryColor : heroText, opacity: 0.85 }} />
            <span className="h-3.5 w-9 rounded-full" style={{ backgroundColor: isMinimal ? colorMix(primaryColor, "#ffffff", 0.72) : heroText, opacity: 0.9 }} />
          </div>
          <span className="h-4 w-10 rounded-full" style={{ backgroundColor: isMinimal ? colorMix(secondaryColor, "#ffffff", 0.82) : heroText, opacity: 0.8 }} />
        </div>

        <div className={`template-preview-hero relative overflow-hidden ${isBoutique ? "mx-3 mt-2 rounded-[1.7rem]" : isGallery ? "m-2 rounded-md" : "m-2 rounded-2xl"}`} style={{ backgroundColor: colorMix(heroBg, "#ffffff", isMinimal ? 0.88 : 0.35) }}>
          <div className={`${isGallery ? "h-16" : "h-20"} px-4 py-3`}>
            <span className="block h-2.5 w-20 rounded-full" style={{ backgroundColor: textColor, opacity: 0.85 }} />
            <span className="mt-2 block h-2 w-32 rounded-full" style={{ backgroundColor: textColor, opacity: 0.35 }} />
            <span className="mt-2 block h-5 w-16 rounded-full" style={{ backgroundColor: primaryColor, opacity: 0.9 }} />
          </div>
          <span className="template-preview-orb absolute -bottom-4 -left-4 h-16 w-16 rounded-full" style={{ backgroundColor: secondaryColor, opacity: 0.55 }} />
        </div>

        <div className="px-3 pb-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="h-6 flex-1 rounded-full bg-surface-container-low" />
            <span className="h-6 w-16 rounded-full" style={{ backgroundColor: colorMix(primaryColor, "#ffffff", 0.76) }} />
          </div>
          <div className={`template-preview-products grid gap-2 ${isGallery ? "grid-cols-5" : isMarket ? "grid-cols-4" : "grid-cols-3"}`}>
            {Array.from({ length: productCount }).map((_, index) => (
              <div
                key={index}
                className={`template-preview-product overflow-hidden border border-outline-variant/10 bg-white ${
                  isBoutique ? "rounded-2xl" : isGallery ? "rounded-md" : "rounded-xl"
                }`}
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <span
                  className="block h-9"
                  style={{
                    backgroundColor: index % 3 === 0 ? colorMix(primaryColor, "#ffffff", 0.68) : index % 3 === 1 ? colorMix(secondaryColor, "#ffffff", 0.76) : colorMix(textColor, "#ffffff", 0.82),
                  }}
                />
                <span className="mx-2 mt-2 block h-1.5 rounded-full" style={{ backgroundColor: textColor, opacity: 0.72 }} />
                <span className="mx-2 mt-1.5 block h-1.5 w-1/2 rounded-full" style={{ backgroundColor: primaryColor, opacity: 0.65 }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-bold text-on-surface">{label}</span>
      <div className="grid gap-3 sm:grid-cols-[80px_1fr]">
        <input className="h-12 w-full cursor-pointer rounded-xl border border-outline-variant bg-surface-container-lowest p-1" type="color" value={value} onChange={(event) => onChange(event.target.value)} />
        <input className="input-field px-4 py-3 text-left" dir="ltr" pattern="^#[0-9a-fA-F]{6}$" required value={value} onChange={(event) => onChange(event.target.value)} />
      </div>
    </label>
  );
}

function ImageUploadField({
  field,
  helper,
  label,
  ratio,
  uploading,
  value,
  noImageText,
  imageUrlOrUploadPlaceholder,
  uploadingText,
  uploadImageText,
  deleteImageText,
  onChange,
  onUpload,
}: {
  field: ImageField;
  helper: string;
  label: string;
  ratio: string;
  uploading: boolean;
  value: string;
  noImageText: string;
  imageUrlOrUploadPlaceholder: string;
  uploadingText: string;
  uploadImageText: string;
  deleteImageText: string;
  onChange: (field: ImageField, value: string) => void;
  onUpload: (field: ImageField, event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="grid gap-3 rounded-2xl border border-outline-variant/25 bg-surface-container-lowest p-4 md:grid-cols-[180px_1fr] md:items-center">
      <div className={`relative overflow-hidden rounded-xl border border-outline-variant/25 bg-surface-container-low ${ratio}`}>
        {value ? <Image alt={label} className="object-cover" src={value} fill sizes="180px" unoptimized /> : <div className="flex h-full w-full items-center justify-center text-sm font-bold text-on-surface-variant">{noImageText}</div>}
      </div>
      <div className="grid gap-3">
        <div>
          <h5 className="font-black text-on-surface">{label}</h5>
          <p className="mt-1 text-sm leading-6 text-on-surface-variant">{helper}</p>
        </div>
        <input className="input-field px-4 py-3 text-left" dir="ltr" placeholder={imageUrlOrUploadPlaceholder} value={value} onChange={(event) => onChange(field, event.target.value)} />
        <div className="flex flex-wrap gap-2">
          <label className="secondary-button cursor-pointer px-5 py-3 text-sm">
            {uploading ? uploadingText : uploadImageText}
            <input className="sr-only" accept="image/png,image/jpeg,image/webp" disabled={uploading} type="file" onChange={(event) => onUpload(field, event)} />
          </label>
          {value ? (
            <button className="secondary-button px-5 py-3 text-sm" type="button" onClick={() => onChange(field, "")}>
              {deleteImageText}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function PreviewBlock({ background, color, label, subLabel }: { background: string; color: string; label: string; subLabel: string }) {
  return (
    <div className="rounded-xl px-4 py-4 font-black" style={{ background, color }}>
      {label}
      <span className="mt-1 block text-sm font-bold opacity-85">{subLabel}</span>
    </div>
  );
}

function readCookie(name: string) {
  const cookie = document.cookie
    .split("; ")
    .find((value) => value.startsWith(`${name}=`))
    ?.split("=")[1];

  return cookie ? decodeURIComponent(cookie) : "";
}

function readablePreviewText(background: string) {
  return contrastRatio(background, "#ffffff") >= 4.5 ? "#ffffff" : "#111827";
}

function contrastRatio(first: string, second: string) {
  const firstLum = relativeLuminance(hexToRgb(first));
  const secondLum = relativeLuminance(hexToRgb(second));
  const lighter = Math.max(firstLum, secondLum);
  const darker = Math.min(firstLum, secondLum);
  return (lighter + 0.05) / (darker + 0.05);
}

function relativeLuminance([r, g, b]: [number, number, number]) {
  const [red, green, blue] = [r, g, b].map((channel) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function colorMix(first: string, second: string, secondAmount: number) {
  const [r1, g1, b1] = hexToRgb(first);
  const [r2, g2, b2] = hexToRgb(second);
  const mix = (start: number, end: number) => Math.round(start * (1 - secondAmount) + end * secondAmount);
  return rgbToHex(mix(r1, r2), mix(g1, g2), mix(b1, b2));
}

function hexToRgb(hex: string): [number, number, number] {
  return [Number.parseInt(hex.slice(1, 3), 16), Number.parseInt(hex.slice(3, 5), 16), Number.parseInt(hex.slice(5, 7), 16)];
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${[r, g, b].map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}
