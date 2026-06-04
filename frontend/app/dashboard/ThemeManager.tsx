"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";
import { ApiError, updateMyTheme, uploadProductImage, VendorTheme } from "@/lib/api";
import { getStoreTemplate, StoreTemplate, storeTemplates, StoreTemplateId } from "@/lib/store-templates";
import { applyThemeTokens } from "@/lib/theme";

type ImageField = "logoUrl" | "bannerUrl" | "storefrontImageUrl";
type SocialField = "whatsappUrl" | "instagramUrl" | "tiktokUrl" | "lineUrl" | "telegramUrl" | "xUrl" | "snapchatUrl" | "youtubeUrl" | "contactEmail" | "websiteUrl";

const imageFields: Array<{
  key: ImageField;
  label: string;
  helper: string;
  ratio: string;
}> = [
  {
    key: "logoUrl",
    label: "أيقونة المتجر",
    helper: "تظهر داخل الدائرة فوق البانر في صفحة التاجر.",
    ratio: "aspect-square",
  },
  {
    key: "bannerUrl",
    label: "بانر المتجر",
    helper: "الصورة العريضة أعلى صفحة التاجر.",
    ratio: "aspect-[16/5]",
  },
  {
    key: "storefrontImageUrl",
    label: "صورة واجهة المتجر",
    helper: "صورة عامة تستخدم كبديل بصري لواجهة المتجر.",
    ratio: "aspect-[4/3]",
  },
];

const socialFields: Array<{
  key: SocialField;
  label: string;
  placeholder: string;
}> = [
  { key: "whatsappUrl", label: "واتساب", placeholder: "https://wa.me/9665..." },
  { key: "instagramUrl", label: "إنستغرام", placeholder: "https://instagram.com/store" },
  { key: "tiktokUrl", label: "تيك توك", placeholder: "https://tiktok.com/@store" },
  { key: "lineUrl", label: "لاين", placeholder: "https://line.me/R/ti/p/@store" },
  { key: "telegramUrl", label: "تيليقرام", placeholder: "https://t.me/store" },
  { key: "xUrl", label: "إكس", placeholder: "https://x.com/store" },
  { key: "snapchatUrl", label: "سناب شات", placeholder: "https://snapchat.com/add/store" },
  { key: "youtubeUrl", label: "يوتيوب", placeholder: "https://youtube.com/@store" },
  { key: "contactEmail", label: "البريد", placeholder: "support@example.com" },
  { key: "websiteUrl", label: "الموقع", placeholder: "https://example.com" },
];

export function ThemeManager({ initialTheme }: { initialTheme: VendorTheme }) {
  const router = useRouter();
  const [primaryColor, setPrimaryColor] = useState(initialTheme.primaryColor);
  const [secondaryColor, setSecondaryColor] = useState(initialTheme.secondaryColor);
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
      setMessage("تم رفع الصورة. اضغط حفظ لتطبيقها على واجهة المتجر.");
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "تعذر رفع الصورة.");
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
      setMessage("تم حفظ واجهة المتجر. الألوان والصور ستظهر الآن في صفحة التاجر ومنتجاته.");
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "تعذر حفظ واجهة المتجر.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section id="theme" className="dashboard-panel overflow-hidden">
      <div className="border-b border-outline-variant/15 p-5 text-right">
        <h4 className="text-xl font-black text-on-surface">هوية واجهة المتجر</h4>
        <p className="mt-1 text-sm leading-6 text-on-surface-variant">
          اختر ألوان المتجر وصورته وأيقونته والبانر الذي يظهر للمشتري. النظام يحسب لون النص المناسب تلقائيا حتى تبقى الكتابة واضحة.
        </p>
      </div>

      <form className="grid gap-5 p-5 text-right lg:grid-cols-[1fr_360px]" dir="rtl" onSubmit={handleSubmit}>
        <div className="grid gap-5">
          <div className="grid gap-4 md:grid-cols-2">
            <ColorField label="اللون الأساسي" value={primaryColor} onChange={setPrimaryColor} />
            <ColorField label="اللون الثانوي" value={secondaryColor} onChange={setSecondaryColor} />
          </div>

          <TemplateSelector primaryColor={primaryColor} secondaryColor={secondaryColor} selectedTemplateId={templateId} onChange={setTemplateId} />
<div className="grid gap-4 rounded-2xl border border-outline-variant/25 bg-surface-container-lowest p-4">
            <label className="grid gap-2">
              <span className="text-sm font-bold text-on-surface">عنوان واجهة المتجر</span>
              <input
                className="input-field px-4 py-3 text-right"
                maxLength={80}
                placeholder="مثال: أحدث منتجات متجرنا"
                value={storefrontTitle}
                onChange={(event) => setStorefrontTitle(event.target.value)}
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-bold text-on-surface">وصف واجهة المتجر</span>
              <textarea
                className="input-field min-h-28 resize-y px-4 py-3 text-right leading-8"
                maxLength={220}
                placeholder="اكتب النص الذي يظهر للعملاء في واجهة المتجر."
                value={storefrontDescription}
                onChange={(event) => setStorefrontDescription(event.target.value)}
              />
            </label>
          </div>

          <div className="grid gap-4 rounded-2xl border border-outline-variant/25 bg-surface-container-lowest p-4">
            <div>
              <h5 className="font-black text-on-surface">روابط التواصل</h5>
              <p className="mt-1 text-sm leading-6 text-on-surface-variant">أضف القنوات التي تريد ظهورها في أسفل صفحات متجرك. اترك أي خانة فارغة لإخفائها.</p>
            </div>
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
          </div>

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
                onChange={setImageValue}
                onUpload={handleImageUpload}
              />
            ))}
          </div>

          {message ? <p className="rounded-xl bg-surface-container-low px-4 py-3 text-sm font-bold text-on-surface">{message}</p> : null}

          <button className="primary-button w-fit px-8 py-3 disabled:opacity-60" disabled={isSaving || uploadingField !== null} type="submit">
            {isSaving ? "جاري الحفظ..." : "حفظ واجهة المتجر"}
          </button>
        </div>

        <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-4">
          <p className="text-sm font-bold text-on-surface-variant">معاينة آخر إعداد محفوظ</p>
          <div className="mt-4 overflow-hidden rounded-2xl border border-outline-variant/25 bg-surface-container-lowest">
            <div className="relative aspect-[16/7] bg-surface-container">
              {previewTheme.bannerUrl || bannerUrl ? <Image alt="معاينة البانر" className="object-cover" src={previewTheme.bannerUrl || bannerUrl} fill sizes="360px" unoptimized /> : null}
            </div>
            <div className="-mt-8 px-4 pb-4">
              <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-white shadow-lg">
                {previewTheme.logoUrl || logoUrl ? <Image alt="معاينة الأيقونة" className="object-contain p-1" src={previewTheme.logoUrl || logoUrl} fill sizes="64px" unoptimized /> : <span className="text-sm font-black text-primary">nmoo</span>}
              </div>
              <div className="mt-4 grid gap-3">
                <PreviewBlock background={previewTheme.tokens.primary} color={previewTheme.tokens.onPrimary} label="زر أساسي" />
                <PreviewBlock background={previewTheme.tokens.secondary} color={previewTheme.tokens.onSecondary} label="زر ثانوي" />
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
  selectedTemplateId,
  onChange,
}: {
  primaryColor: string;
  secondaryColor: string;
  selectedTemplateId: StoreTemplateId;
  onChange: (value: StoreTemplateId) => void;
}) {
  return (
    <section className="grid gap-4 rounded-2xl border border-outline-variant/25 bg-surface-container-lowest p-4">
      <div>
        <h5 className="font-black text-on-surface">قالب تصميم المتجر</h5>
        <p className="mt-1 text-sm leading-6 text-on-surface-variant">اختر شكل واجهة المتجر. كل قالب يستخدم اللون الأساسي والثانوي الخاصين بمتجرك في كل الصفحات.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {storeTemplates.map((template) => (
          <TemplateOption
            key={template.id}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            selected={selectedTemplateId === template.id}
            template={template}
            onChange={onChange}
          />
        ))}
      </div>
    </section>
  );
}

function TemplateOption({
  primaryColor,
  secondaryColor,
  selected,
  template,
  onChange,
}: {
  primaryColor: string;
  secondaryColor: string;
  selected: boolean;
  template: StoreTemplate;
  onChange: (value: StoreTemplateId) => void;
}) {
  return (
    <label className={`cursor-pointer overflow-hidden rounded-2xl border bg-white text-right transition ${selected ? "border-primary shadow-md ring-2 ring-primary-container" : "border-outline-variant/25 hover:border-primary/50"}`}>
      <input checked={selected} className="sr-only" name="store-template" type="radio" value={template.id} onChange={() => onChange(template.id)} />
      <TemplatePreview primaryColor={primaryColor} secondaryColor={secondaryColor} templateId={template.id} />
      <div className="grid gap-1 p-4">
        <span className="text-base font-black text-on-surface">{template.name}</span>
        <span className="text-sm leading-6 text-on-surface-variant">{template.description}</span>
        <span className="mt-2 w-fit rounded-full px-3 py-1 text-xs font-black" style={{ backgroundColor: primaryColor, color: readablePreviewText(primaryColor) }}>
          {selected ? "محدد" : template.previewTone}
        </span>
      </div>
    </label>
  );
}

function TemplatePreview({ primaryColor, secondaryColor, templateId }: { primaryColor: string; secondaryColor: string; templateId: StoreTemplateId }) {
  const isBoutique = templateId === "boutique";
  const isGallery = templateId === "gallery";

  return (
    <div className={`h-36 border-b border-outline-variant/20 p-3 ${isGallery ? "bg-slate-50" : "bg-surface-container-low"}`}>
      <div className={`h-full overflow-hidden ${isBoutique ? "rounded-[28px]" : isGallery ? "rounded-md" : "rounded-xl"}`} style={{ backgroundColor: "#ffffff" }}>
        <div className={`flex h-14 items-center gap-2 px-3 ${isGallery ? "justify-between" : "justify-end"}`} style={{ backgroundColor: isGallery ? secondaryColor : primaryColor }}>
          <span className="h-5 w-12 rounded-full" style={{ backgroundColor: readablePreviewText(isGallery ? secondaryColor : primaryColor), opacity: 0.9 }} />
          <span className="h-5 w-5 rounded-full" style={{ backgroundColor: readablePreviewText(isGallery ? secondaryColor : primaryColor), opacity: 0.75 }} />
        </div>
        <div className={`grid gap-2 p-3 ${isGallery ? "grid-cols-3" : "grid-cols-2"}`}>
          {[0, 1, 2].map((item) => (
            <span
              key={item}
              className={`${isBoutique ? "rounded-2xl" : isGallery ? "rounded-md" : "rounded-xl"} block h-12`}
              style={{ backgroundColor: item === 0 ? primaryColor : item === 1 ? secondaryColor : colorMix(primaryColor, "#ffffff", 0.72) }}
            />
          ))}
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
  onChange,
  onUpload,
}: {
  field: ImageField;
  helper: string;
  label: string;
  ratio: string;
  uploading: boolean;
  value: string;
  onChange: (field: ImageField, value: string) => void;
  onUpload: (field: ImageField, event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="grid gap-3 rounded-2xl border border-outline-variant/25 bg-surface-container-lowest p-4 md:grid-cols-[180px_1fr] md:items-center">
      <div className={`relative overflow-hidden rounded-xl border border-outline-variant/25 bg-surface-container-low ${ratio}`}>
        {value ? <Image alt={label} className="object-cover" src={value} fill sizes="180px" unoptimized /> : <div className="flex h-full w-full items-center justify-center text-sm font-bold text-on-surface-variant">لا توجد صورة</div>}
      </div>
      <div className="grid gap-3">
        <div>
          <h5 className="font-black text-on-surface">{label}</h5>
          <p className="mt-1 text-sm leading-6 text-on-surface-variant">{helper}</p>
        </div>
        <input className="input-field px-4 py-3 text-left" dir="ltr" placeholder="رابط الصورة أو ارفع ملف" value={value} onChange={(event) => onChange(field, event.target.value)} />
        <div className="flex flex-wrap gap-2">
          <label className="secondary-button cursor-pointer px-5 py-3 text-sm">
            {uploading ? "جاري الرفع..." : "رفع صورة"}
            <input className="sr-only" accept="image/png,image/jpeg,image/webp" disabled={uploading} type="file" onChange={(event) => onUpload(field, event)} />
          </label>
          {value ? (
            <button className="secondary-button px-5 py-3 text-sm" type="button" onClick={() => onChange(field, "")}>
              حذف الصورة
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function PreviewBlock({ background, color, label }: { background: string; color: string; label: string }) {
  return (
    <div className="rounded-xl px-4 py-4 font-black" style={{ background, color }}>
      {label}
      <span className="mt-1 block text-sm font-bold opacity-85">النص واضح حسب اللون المختار</span>
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
