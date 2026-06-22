export type StoreTemplateId = "classic" | "boutique" | "gallery" | "minimal" | "market";

export type StoreTemplate = {
  id: StoreTemplateId;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  previewTone: string;
  previewToneEn: string;
  className: string;
};

export const storeTemplates: StoreTemplate[] = [
  {
    id: "classic",
    name: "كلاسيكي",
    nameEn: "Classic",
    description: "تخطيط واضح ومتوازن يناسب أغلب المتاجر.",
    descriptionEn: "A clear, balanced layout suited for most stores.",
    previewTone: "بطاقات مرتبة وهيرو بسيط",
    previewToneEn: "Organized cards and a simple hero",
    className: "store-template-classic",
  },
  {
    id: "boutique",
    name: "بوتيك",
    nameEn: "Boutique",
    description: "واجهة ناعمة بصور أكبر وحواف دائرية للمظهر الفاخر.",
    descriptionEn: "A refined interface with larger images and rounded corners for a luxurious look.",
    previewTone: "صورة كبيرة ولمسات ناعمة",
    previewToneEn: "Large image and soft touches",
    className: "store-template-boutique",
  },
  {
    id: "gallery",
    name: "معرض",
    nameEn: "Gallery",
    description: "عرض بصري قوي للمنتجات مع تباين أوضح وأقسام مضغوطة.",
    descriptionEn: "A visually powerful product display with strong contrast and compact sections.",
    previewTone: "شبكة بارزة وتركيز على الصور",
    previewToneEn: "Bold grid focused on imagery",
    className: "store-template-gallery",
  },
  {
    id: "minimal",
    name: "هادئ",
    nameEn: "Minimal",
    description: "تخطيط نظيف بمساحات واسعة وواجهة هادئة تبرز النص والمنتج بدون ازدحام.",
    descriptionEn: "A clean layout with generous whitespace that highlights text and products without clutter.",
    previewTone: "مساحات واسعة وبطاقات خفيفة",
    previewToneEn: "Wide spacing and light cards",
    className: "store-template-minimal",
  },
  {
    id: "market",
    name: "سوق حديث",
    nameEn: "Modern Market",
    description: "واجهة جريئة بكُتل واضحة وشبكة منتجات كثيفة مناسبة للمتاجر كثيرة الأصناف.",
    descriptionEn: "A bold interface with clear blocks and a dense product grid suited for stores with many items.",
    previewTone: "كتل قوية وشبكة كثيفة",
    previewToneEn: "Strong blocks and dense grid",
    className: "store-template-market",
  },
];

export function getStoreTemplate(templateId?: string | null) {
  return storeTemplates.find((template) => template.id === templateId) ?? storeTemplates[0];
}
