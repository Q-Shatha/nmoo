"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, Category, Product, updateProduct } from "@/lib/api";
import { useI18n } from "@/lib/i18n/context";
import { DashboardAccordion } from "../../DashboardAccordion";
import { calculateProductStock, normalizeProductAddons, normalizeProductOptions, ProductAddonsEditor, ProductDraft, ProductFields, ProductImageUploader, ProductOptionsEditor } from "../../DashboardProductManager";

type EditProductFormProps = {
  categories: Category[];
  product: Product;
};

export function EditProductForm({ categories, product }: EditProductFormProps) {
  const router = useRouter();
  const { t } = useI18n();
  const [draft, setDraft] = useState<ProductDraft>(() => productToDraft(product));
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSaving(true);

    try {
      const token = readCookie("nmoo_access_token");
      await updateProduct(
        product.id,
        {
          title: draft.title,
          description: draft.description,
          badgeLabel: draft.badgeLabel,
          price: Number(draft.price),
          discountType: draft.discountType || undefined,
          discountValue: draft.discountType ? Number(draft.discountValue || 0) : 0,
          stock: calculateProductStock(draft),
          categoryId: draft.categoryId || undefined,
          imageUrl: draft.imageUrls[0] || undefined,
          imageUrls: draft.imageUrls,
          options: normalizeProductOptions(draft.options),
          addons: normalizeProductAddons(draft.addons),
          status: draft.status,
        },
        token,
      );

      router.push("/dashboard/products");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : t.productUpdateError);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="dashboard-panel grid gap-6 p-6 text-start" onSubmit={handleSubmit}>
      <section className="grid gap-5 rounded-xl bg-surface-container-low p-4 text-start">
        <div>
          <h2 className="text-lg font-black text-on-surface">{t.productDataTitle}</h2>
          <p className="mt-1 text-sm leading-6 text-on-surface-variant">{t.editProductDataDesc}</p>
        </div>
        <DashboardAccordion title={t.productFieldsBasic} defaultOpen>
          <ProductFields categories={categories} draft={draft} setDraft={setDraft} />
        </DashboardAccordion>
      </section>

      <DashboardAccordion title={t.productFieldsVariants} description={t.variantsAccordionEditDesc}>
        <ProductOptionsEditor options={draft.options} onChange={(options) => setDraft({ ...draft, options })} />
      </DashboardAccordion>

      <DashboardAccordion title={t.productFieldsAddons} description={t.addonsAccordionDesc}>
        <ProductAddonsEditor addons={draft.addons} onChange={(addons) => setDraft({ ...draft, addons })} />
      </DashboardAccordion>

      <DashboardAccordion title={t.productFieldsImages} description={t.imagesAccordionDesc}>
        <ProductImageUploader imageUrls={draft.imageUrls} onAddImage={addImageUrl} onRemoveImage={removeImageUrl} />
      </DashboardAccordion>

      {message ? <p className="rounded-xl bg-surface-container-low px-4 py-3 text-sm font-bold text-on-surface">{message}</p> : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button className="primary-button px-8 py-4 disabled:opacity-60" disabled={isSaving} type="submit">
          {isSaving ? t.savingEdit : t.saveEdit}
        </button>
        <button className="secondary-button px-8 py-4" type="button" onClick={() => router.push("/dashboard/products")}>
          {t.backToProducts}
        </button>
      </div>
    </form>
  );
}

function productToDraft(product: Product): ProductDraft {
  return {
    title: product.title,
    description: product.description ?? "",
    badgeLabel: product.badgeLabel ?? "",
    price: String(product.price),
    discountType: product.discountType ?? "",
    discountValue: product.discountValue ? String(product.discountValue) : "",
    stock: String(product.stock),
    categoryId: product.categoryId ?? "",
    status: product.status,
    imageUrls: product.images?.map((image) => image.url) ?? (product.imageUrl ? [product.imageUrl] : []),
    options:
      product.options?.map((option) => ({
        name: option.name,
        values: option.values.map((value) => ({
          value,
          quantity: String(option.valueQuantities?.[value] ?? 0),
          price: String(option.valuePrices?.[value] ?? product.price),
        })),
      })) ?? [],
    addons:
      product.addons?.map((addon) => ({
        name: addon.name,
        price: String(addon.price),
        enabled: addon.enabled,
      })) ?? [],
  };
}

function readCookie(name: string) {
  const cookie = document.cookie
    .split("; ")
    .find((value) => value.startsWith(`${name}=`))
    ?.split("=")[1];

  return cookie ? decodeURIComponent(cookie) : "";
}
