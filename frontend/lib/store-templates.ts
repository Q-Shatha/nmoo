export type StoreTemplateId = "classic" | "boutique" | "gallery" | "minimal" | "market";

export type StoreTemplate = {
  id: StoreTemplateId;
  name: string;
  description: string;
  previewTone: string;
  className: string;
};

export const storeTemplates: StoreTemplate[] = [
  {
    id: "classic",
    name: "كلاسيكي",
    description: "تخطيط واضح ومتوازن يناسب أغلب المتاجر.",
    previewTone: "بطاقات مرتبة وهيرو بسيط",
    className: "store-template-classic",
  },
  {
    id: "boutique",
    name: "بوتيك",
    description: "واجهة ناعمة بصور أكبر وحواف دائرية للمظهر الفاخر.",
    previewTone: "صورة كبيرة ولمسات ناعمة",
    className: "store-template-boutique",
  },
  {
    id: "gallery",
    name: "معرض",
    description: "عرض بصري قوي للمنتجات مع تباين أوضح وأقسام مضغوطة.",
    previewTone: "شبكة بارزة وتركيز على الصور",
    className: "store-template-gallery",
  },
  {
    id: "minimal",
    name: "هادئ",
    description: "تخطيط نظيف بمساحات واسعة وواجهة هادئة تبرز النص والمنتج بدون ازدحام.",
    previewTone: "مساحات واسعة وبطاقات خفيفة",
    className: "store-template-minimal",
  },
  {
    id: "market",
    name: "سوق حديث",
    description: "واجهة جريئة بكُتل واضحة وشبكة منتجات كثيفة مناسبة للمتاجر كثيرة الأصناف.",
    previewTone: "كتل قوية وشبكة كثيفة",
    className: "store-template-market",
  },
];

export function getStoreTemplate(templateId?: string | null) {
  return storeTemplates.find((template) => template.id === templateId) ?? storeTemplates[0];
}
