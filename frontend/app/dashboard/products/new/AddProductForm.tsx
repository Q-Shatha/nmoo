"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, Category, createCategory, createProduct, ProductStatus } from "@/lib/api";
import { useI18n } from "@/lib/i18n/context";
import { DashboardAccordion } from "../../DashboardAccordion";
import { calculateProductStock, normalizeProductAddons, normalizeProductOptions, ProductAddonsEditor, ProductDraft, ProductFields, ProductImageUploader, ProductOptionsEditor } from "../../DashboardProductManager";

const emptyDraft: ProductDraft = {
  title: "",
  titleAr: "",
  titleEn: "",
  description: "",
  descriptionAr: "",
  descriptionEn: "",
  badgeLabel: "",
  badgeLabelAr: "",
  badgeLabelEn: "",
  price: "",
  discountType: "",
  discountValue: "",
  stock: "0",
  categoryId: "",
  status: "ACTIVE" as ProductStatus,
  imageUrls: [],
  options: [],
  addons: [],
};

export function AddProductForm({ categories: initialCategories }: { categories: Category[] }) {
  const router = useRouter();
  const { t } = useI18n();
  const [categories, setCategories] = useState(initialCategories);
  const [draft, setDraft] = useState<ProductDraft>(emptyDraft);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  function addImageUrl(url: string) {
    if (!url || draft.imageUrls.includes(url)) {
      return;
    }

    setDraft({
      ...draft,
      imageUrls: [...draft.imageUrls, url],
    });
  }

  function removeImageUrl(url: string) {
    setDraft({
      ...draft,
      imageUrls: draft.imageUrls.filter((item) => item !== url),
    });
  }

  async function handleCreateCategory() {
    const name = newCategoryName.trim();

    if (!name) {
      return;
    }

    setMessage("");
    setIsCreatingCategory(true);

    try {
      const token = readCookie("nmoo_access_token");
      const category = await createCategory({ name }, token);
      setCategories((current) => [...current.filter((item) => item.vendorId), category].sort((first, second) => first.name.localeCompare(second.name, "ar")));
      setDraft((current) => ({
        ...current,
        categoryId: category.id,
      }));
      setNewCategoryName("");
      setMessage(t.categoryAddedAndSelected);
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : t.categoryAddError);
    } finally {
      setIsCreatingCategory(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSaving(true);

    try {
      const token = readCookie("nmoo_access_token");
      await createProduct(
        {
          title: draft.title,
          titleAr: draft.titleAr || undefined,
          titleEn: draft.titleEn || undefined,
          description: draft.description,
          descriptionAr: draft.descriptionAr || undefined,
          descriptionEn: draft.descriptionEn || undefined,
          badgeLabel: draft.badgeLabel,
          badgeLabelAr: draft.badgeLabelAr || undefined,
          badgeLabelEn: draft.badgeLabelEn || undefined,
          price: Number(draft.price),
          discountType: draft.discountType || undefined,
          discountValue: draft.discountType ? Number(draft.discountValue || 0) : 0,
          stock: calculateProductStock(draft),
          categoryId: draft.categoryId || undefined,
          imageUrl: draft.imageUrls[0] || undefined,
          imageUrls: draft.imageUrls.filter(Boolean),
          options: normalizeProductOptions(draft.options),
          addons: normalizeProductAddons(draft.addons),
          status: draft.status,
        },
        token,
      );

      router.push("/dashboard/products");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : t.addProductError);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="dashboard-panel grid gap-6 p-6 text-start" onSubmit={handleSubmit}>
      <section className="grid gap-5 rounded-xl bg-surface-container-low p-4 text-start">
        <div>
          <h2 className="text-lg font-black text-on-surface">{t.productDataTitle}</h2>
          <p className="mt-1 text-sm leading-6 text-on-surface-variant">{t.productDataDesc}</p>
        </div>
        <DashboardAccordion title={t.productFieldsBasic} defaultOpen>
          <ProductFields categories={categories} draft={draft} setDraft={setDraft} />
        </DashboardAccordion>
      </section>

      <DashboardAccordion title={t.productFieldsVariants} description={t.variantsAccordionDesc}>
        <ProductOptionsEditor options={draft.options} onChange={(options) => setDraft({ ...draft, options })} />
      </DashboardAccordion>

      <DashboardAccordion title={t.productFieldsAddons} description={t.addonsAccordionDesc}>
        <ProductAddonsEditor addons={draft.addons} onChange={(addons) => setDraft({ ...draft, addons })} />
      </DashboardAccordion>

      <section className="grid gap-3 rounded-xl bg-surface-container-low p-4 text-start">
        <div>
          <h2 className="text-lg font-black text-on-surface">{t.newCategoryTitle}</h2>
          <p className="mt-1 text-sm leading-6 text-on-surface-variant">{t.newCategoryDesc}</p>
        </div>
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <input
            className="input-field px-4 py-3 text-start"
            dir="auto"
            placeholder={t.categoryNamePlaceholder}
            value={newCategoryName}
            onChange={(event) => setNewCategoryName(event.target.value)}
          />
          <button className="secondary-button px-5 py-3 disabled:opacity-60" disabled={isCreatingCategory || !newCategoryName.trim()} type="button" onClick={handleCreateCategory}>
            {isCreatingCategory ? t.addingCategory : t.addCategoryButton}
          </button>
        </div>
      </section>

      <DashboardAccordion title={t.productFieldsImages} description={t.imagesAccordionDesc}>
        <ProductImageUploader imageUrls={draft.imageUrls} onAddImage={addImageUrl} onRemoveImage={removeImageUrl} />
      </DashboardAccordion>

      {message ? <p className="rounded-xl bg-surface-container-low px-4 py-3 text-sm font-bold text-on-surface">{message}</p> : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button className="primary-button px-8 py-4 disabled:opacity-60" disabled={isSaving} type="submit">
          {isSaving ? t.addingProduct : t.addProductButton}
        </button>
        <button className="secondary-button px-8 py-4" type="button" onClick={() => router.push("/dashboard/products")}>
          {t.backToProducts}
        </button>
      </div>
    </form>
  );
}

function readCookie(name: string) {
  const cookie = document.cookie
    .split("; ")
    .find((value) => value.startsWith(`${name}=`))
    ?.split("=")[1];

  return cookie ? decodeURIComponent(cookie) : "";
}
