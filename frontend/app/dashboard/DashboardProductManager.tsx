"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { FiEdit3, FiPlus, FiTrash2, FiX } from "react-icons/fi";
import { ApiError, Category, deleteCategory, deleteProduct, DiscountType, Product, ProductStatus, restoreProduct, updateCategory, updateProduct, uploadProductImage } from "@/lib/api";
import { DashboardAccordion } from "./DashboardAccordion";
import { useI18n } from "@/lib/i18n/context";

export type ProductDraft = {
  title: string;
  titleAr: string;
  titleEn: string;
  description: string;
  descriptionAr: string;
  descriptionEn: string;
  badgeLabel: string;
  badgeLabelAr: string;
  badgeLabelEn: string;
  price: string;
  discountType: DiscountType | "";
  discountValue: string;
  stock: string;
  categoryId: string;
  status: ProductStatus;
  imageUrls: string[];
  options: ProductOptionDraft[];
  addons: ProductAddonDraft[];
};

export type ProductOptionDraft = {
  name: string;
  nameAr: string;
  nameEn: string;
  values: Array<{
    value: string;
    valueAr: string;
    valueEn: string;
    quantity: string;
    price: string;
  }>;
};

export type ProductAddonDraft = {
  name: string;
  nameAr: string;
  nameEn: string;
  price: string;
  enabled: boolean;
};

export function DashboardProductManager({ categories, initialProducts }: { categories: Category[]; initialProducts: Product[] }) {
  const { t } = useI18n();
  const [categoryList, setCategoryList] = useState(categories);
  const [products, setProducts] = useState(initialProducts);
  const [draft, setDraft] = useState<ProductDraft | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const activeProducts = products.filter((product) => product.status !== "ARCHIVED");
  const deletedProducts = products.filter((product) => product.status === "ARCHIVED");

  function startEdit(product: Product) {
    setEditingProduct(product);
    setDraft({
      title: product.title,
      titleAr: product.titleAr ?? "",
      titleEn: product.titleEn ?? "",
      description: product.description ?? "",
      descriptionAr: product.descriptionAr ?? "",
      descriptionEn: product.descriptionEn ?? "",
      badgeLabel: product.badgeLabel ?? "",
      badgeLabelAr: product.badgeLabelAr ?? "",
      badgeLabelEn: product.badgeLabelEn ?? "",
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
          nameAr: option.nameAr ?? "",
          nameEn: option.nameEn ?? "",
          values: option.values.map((value, i) => ({
            value,
            valueAr: option.valuesAr?.[i] ?? "",
            valueEn: option.valuesEn?.[i] ?? "",
            quantity: String(option.valueQuantities?.[value] ?? 0),
            price: String(option.valuePrices?.[value] ?? product.price),
          })),
        })) ?? [],
      addons:
        product.addons?.map((addon) => ({
          name: addon.name,
          nameAr: addon.nameAr ?? "",
          nameEn: addon.nameEn ?? "",
          price: String(addon.price),
          enabled: addon.enabled,
        })) ?? [],
    });
    setMessage("");
  }

  function resetEdit() {
    setEditingProduct(null);
    setDraft(null);
  }

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingProduct || !draft) {
      return;
    }

    setMessage("");
    setIsSaving(true);

    try {
      const token = readCookie("nmoo_access_token");
      const product = await updateProduct(
        editingProduct.id,
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
          imageUrls: draft.imageUrls,
          options: normalizeProductOptions(draft.options),
          addons: normalizeProductAddons(draft.addons),
          status: draft.status,
        },
        token,
      );

      setProducts((current) => current.map((item) => (item.id === product.id ? product : item)));
      resetEdit();
      setMessage(t.productUpdated);
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : t.productUpdateError);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(product: Product) {
    const confirmed = window.confirm(t.confirmDeleteProduct(product.title));

    if (!confirmed) {
      return;
    }

    setMessage("");

    try {
      const token = readCookie("nmoo_access_token");
      const archivedProduct = await deleteProduct(product.id, token);
      setProducts((current) => current.map((item) => (item.id === archivedProduct.id ? archivedProduct : item)));
      if (editingProduct?.id === product.id) {
        resetEdit();
      }
      setMessage(t.productRemovedFromList);
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : t.productDeleteError);
    }
  }

  async function handleRestore(product: Product) {
    setMessage("");

    try {
      const token = readCookie("nmoo_access_token");
      const restoredProduct = await restoreProduct(product.id, token);
      setProducts((current) => current.map((item) => (item.id === restoredProduct.id ? restoredProduct : item)));
      setMessage(t.productRestored);
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : t.productRestoreError);
    }
  }

  function addImageUrl(url: string) {
    if (!draft || !url || draft.imageUrls.includes(url)) {
      return;
    }

    setDraft({
      ...draft,
      imageUrls: [...draft.imageUrls, url],
    });
  }

  function removeImageUrl(url: string) {
    if (!draft) {
      return;
    }

    setDraft({
      ...draft,
      imageUrls: draft.imageUrls.filter((item) => item !== url),
    });
  }

  return (
    <section id="products" className="dashboard-panel overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-outline-variant/15 p-5 text-start sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h4 className="text-xl font-black text-on-surface">{t.manageProducts}</h4>
          <p className="mt-1 text-sm text-on-surface-variant">{t.manageProductsDesc}</p>
        </div>
        <Link className="primary-button px-6 py-3" href="/dashboard/products/new">
          {t.addProduct}
        </Link>
      </div>

      {draft && editingProduct ? (
        <form className="grid gap-5 border-b border-outline-variant/15 p-5 text-start" onSubmit={handleUpdate}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h5 className="text-lg font-black text-on-surface">{t.editProductTitle}</h5>
            <button className="secondary-button px-5 py-2" type="button" onClick={resetEdit}>
              {t.cancel}
            </button>
          </div>

          <DashboardAccordion title={t.productFieldsBasic} defaultOpen>
            <ProductFields categories={categoryList} draft={draft} setDraft={setDraft} />
          </DashboardAccordion>
          <DashboardAccordion title={t.productFieldsVariants}>
            <ProductOptionsEditor options={draft.options} onChange={(options) => setDraft({ ...draft, options })} />
          </DashboardAccordion>
          <DashboardAccordion title={t.productFieldsAddons}>
            <ProductAddonsEditor addons={draft.addons} onChange={(addons) => setDraft({ ...draft, addons })} />
          </DashboardAccordion>
          <DashboardAccordion title={t.productFieldsImages}>
            <ProductImageUploader imageUrls={draft.imageUrls} onAddImage={addImageUrl} onRemoveImage={removeImageUrl} />
          </DashboardAccordion>

          <button className="primary-button w-full py-4 disabled:opacity-60 sm:w-fit sm:px-8" disabled={isSaving} type="submit">
            {isSaving ? t.saving : t.saveEdit}
          </button>
        </form>
      ) : null}

      {message ? <p className="mx-5 mt-5 rounded-xl bg-surface-container-low px-4 py-3 text-sm font-bold text-on-surface">{message}</p> : null}

      <CategoryManager
        categories={categoryList}
        onCategoriesChange={setCategoryList}
        onCategoryDeleted={(categoryId) => {
          setProducts((current) => current.map((product) => (product.categoryId === categoryId ? { ...product, categoryId: null, category: null } : product)));
          if (draft?.categoryId === categoryId) {
            setDraft({ ...draft, categoryId: "" });
          }
        }}
      />

      <div className="grid gap-3 p-4 md:p-5">
        {activeProducts.length === 0 ? (
          <p className="py-6 text-center font-bold text-on-surface-variant">{t.noProducts}</p>
        ) : (
          activeProducts.map((product) => <ProductRow key={product.id} product={product} onDelete={handleDelete} onEdit={startEdit} />)
        )}
      </div>

      <DeletedProductsSection products={deletedProducts} onRestore={handleRestore} />
    </section>
  );
}

function CategoryManager({
  categories,
  onCategoriesChange,
  onCategoryDeleted,
}: {
  categories: Category[];
  onCategoriesChange: (categories: Category[]) => void;
  onCategoryDeleted: (categoryId: string) => void;
}) {
  const { t } = useI18n();
  const vendorCategories = categories.filter((category) => category.vendorId);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  function startEdit(category: Category) {
    setEditingId(category.id);
    setDraftName(category.name);
    setMessage("");
  }

  function cancelEdit() {
    setEditingId(null);
    setDraftName("");
    setMessage("");
  }

  async function handleUpdate(category: Category) {
    const name = draftName.trim();

    if (name.length < 2) {
      setMessage(t.categoryNameTooShort);
      return;
    }

    setIsSaving(true);
    setMessage("");

    try {
      const token = readCookie("nmoo_access_token");
      const updated = await updateCategory(category.id, { name }, token);
      onCategoriesChange(categories.map((item) => (item.id === updated.id ? updated : item)).sort(sortCategories));
      cancelEdit();
      setMessage(t.categoryUpdated);
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : t.categoryUpdateError);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(category: Category) {
    const confirmed = window.confirm(t.confirmDeleteCategory(category.name));

    if (!confirmed) {
      return;
    }

    setIsSaving(true);
    setMessage("");

    try {
      const token = readCookie("nmoo_access_token");
      await deleteCategory(category.id, token);
      onCategoriesChange(categories.filter((item) => item.id !== category.id));
      onCategoryDeleted(category.id);
      if (editingId === category.id) {
        cancelEdit();
      }
      setMessage(t.categoryDeleted);
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : t.categoryDeleteError);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <DashboardAccordion title={t.manageCategoriesTitle} description={t.manageCategoriesDesc} defaultOpen>
      <section className="grid gap-4 text-start">
        {message ? <p className="rounded-xl bg-surface-container-low px-4 py-3 text-sm font-bold text-on-surface">{message}</p> : null}

        <div className="grid gap-3">
          <h5 className="font-black text-on-surface">{t.yourCategories}</h5>
          {vendorCategories.length === 0 ? (
            <p className="rounded-xl bg-surface-container-low p-4 text-sm font-bold text-on-surface-variant">{t.noCustomCategories}</p>
          ) : (
            vendorCategories.map((category) => (
              <article key={category.id} className="grid gap-3 rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                {editingId === category.id ? (
                  <input className="input-field px-4 py-3 text-start" value={draftName} onChange={(event) => setDraftName(event.target.value)} />
                ) : (
                  <div>
                    <p className="font-black text-on-surface">{category.name}</p>
                    <p className="mt-1 text-xs font-bold text-on-surface-variant">{t.productCountInCategory(category._count?.products ?? 0)}</p>
                  </div>
                )}
                <div className="flex gap-2 sm:justify-end">
                  {editingId === category.id ? (
                    <>
                      <button className="primary-button min-w-20 px-4 py-2 text-sm" disabled={isSaving} type="button" onClick={() => handleUpdate(category)}>
                        {t.save}
                      </button>
                      <button className="secondary-button min-w-20 px-4 py-2 text-sm" disabled={isSaving} type="button" onClick={cancelEdit}>
                        {t.cancel}
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="secondary-button h-10 w-10 p-0 text-[0px]" type="button" title={t.editCategory} aria-label={t.editCategoryAriaLabel(category.name)} onClick={() => startEdit(category)}>
                        <FiEdit3 aria-hidden="true" className="h-4 w-4" />
                      </button>
                      <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-error/30 p-0 text-[0px] font-bold text-error hover:bg-error-container/40" type="button" title={t.deleteCategory} aria-label={t.deleteCategoryAriaLabel(category.name)} onClick={() => handleDelete(category)}>
                        <FiTrash2 aria-hidden="true" className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </article>
            ))
          )}
        </div>

      </section>
    </DashboardAccordion>
  );
}

const SUPPORTED_LANGS = [
  { code: "ar", label: "العربية" },
  { code: "en", label: "English" },
] as const;

const LANG_META: Record<string, { label: string; flag: string }> = {
  ar: { label: "العربية", flag: "🇸🇦" },
  en: { label: "English", flag: "🇬🇧" },
};

function LangSectionLabel({ lang }: { lang: string }) {
  const meta = LANG_META[lang];
  if (!meta) return null;
  return (
    <div className="flex items-center gap-2">
      <span className="rounded-md bg-surface-container px-2.5 py-1 text-xs font-bold text-on-surface-variant">
        {meta.flag} {meta.label}
      </span>
    </div>
  );
}

function AddLangButton({ addedLangs, onAdd }: { addedLangs: string[]; onAdd: (lang: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const available = SUPPORTED_LANGS.filter((l) => !addedLangs.includes(l.code));

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  if (available.length === 0) return null;

  return (
    <div ref={ref} className="relative w-fit">
      <button
        type="button"
        title="إضافة لغة"
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-dashed border-outline-variant/50 text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
        onClick={() => setOpen((v) => !v)}
      >
        <FiPlus className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute start-0 top-10 z-20 min-w-[130px] rounded-xl border border-outline-variant/30 bg-surface shadow-lg">
          {available.map((lang) => (
            <button
              key={lang.code}
              type="button"
              dir="ltr"
              className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-bold text-on-surface hover:bg-surface-container-low"
              onClick={() => { onAdd(lang.code); setOpen(false); }}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ProductFields({
  categories,
  draft,
  setDraft,
}: {
  categories: Category[];
  draft: ProductDraft;
  setDraft: (draft: ProductDraft) => void;
}) {
  const { t } = useI18n();
  const [addedLangs, setAddedLangs] = useState<string[]>(() => {
    const langs: string[] = [];
    if (draft.titleAr || draft.descriptionAr || draft.badgeLabelAr) langs.push("ar");
    if (draft.titleEn || draft.descriptionEn || draft.badgeLabelEn) langs.push("en");
    if (langs.length === 0) langs.push("ar", "en");
    return langs;
  });
  const optionsStock = calculateDraftOptionsStock(draft.options);
  const hasOptionQuantities = hasDraftOptionQuantities(draft.options);

  function removeLang(lang: string) {
    setAddedLangs((prev) => prev.filter((l) => l !== lang));
    if (lang === "ar") setDraft({ ...draft, titleAr: "", descriptionAr: "", badgeLabelAr: "" });
    if (lang === "en") setDraft({ ...draft, titleEn: "", descriptionEn: "", badgeLabelEn: "" });
  }

  return (
    <>
      {/* Default + language sections container */}
      <div className="rounded-2xl border border-outline-variant/25 bg-surface-container-lowest p-4">
        {/* Default header */}
        <div className="mb-3 flex items-center gap-2">
          <span className="rounded-md bg-surface-container px-2.5 py-1 text-xs font-bold text-on-surface-variant">Default</span>
          <span className="text-xs text-on-surface-variant">{t.defaultLangHint}</span>
        </div>

        {/* Default fields */}
        <div className="grid gap-4 text-start">
          <div className="grid gap-4 lg:grid-cols-6">
            <label className="grid gap-2 lg:col-span-2">
              <RequiredLabel>{t.productNameLabel}</RequiredLabel>
              <input className="input-field px-4 py-3 text-start" dir="auto" required value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-bold text-on-surface">{t.productBadge}</span>
              <input className="input-field px-4 py-3 text-start" dir="auto" maxLength={40} placeholder={t.productBadgePlaceholder} value={draft.badgeLabel} onChange={(event) => setDraft({ ...draft, badgeLabel: event.target.value })} />
            </label>
            <label className="grid gap-2">
              <RequiredLabel>{t.productPriceLabel}</RequiredLabel>
              <input className="input-field px-4 py-3 text-right" dir="ltr" min="0" required step="0.01" type="number" value={draft.price} onChange={(event) => setDraft({ ...draft, price: event.target.value })} />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-bold text-on-surface">{t.discountTypeLabel2}</span>
              <select className="input-field px-4 py-3 text-start" value={draft.discountType} onChange={(event) => setDraft({ ...draft, discountType: event.target.value as DiscountType | "", discountValue: event.target.value ? draft.discountValue : "" })}>
                <option value="">{t.noDiscount}</option>
                <option value="PERCENTAGE">{t.percentageDiscount}</option>
                <option value="FIXED">{t.fixedDiscount}</option>
              </select>
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-bold text-on-surface">{t.discountValueLabel}</span>
              <input className="input-field px-4 py-3 text-start disabled:opacity-50" dir="ltr" disabled={!draft.discountType} max={draft.discountType === "PERCENTAGE" ? "100" : undefined} min="0" step="0.01" type="number" value={draft.discountValue} onChange={(event) => setDraft({ ...draft, discountValue: event.target.value })} />
            </label>
            <label className="grid gap-2">
              <RequiredLabel>{t.quantityLabel2}</RequiredLabel>
              <input className="input-field px-4 py-3 text-start read-only:bg-surface-container-low read-only:text-on-surface" dir="ltr" min="0" readOnly={hasOptionQuantities} required type="number" value={hasOptionQuantities ? String(optionsStock) : draft.stock} onChange={(event) => setDraft({ ...draft, stock: event.target.value })} />
              {hasOptionQuantities && <span className="text-xs font-bold text-on-surface-variant">{t.currentTotal}{formatStockBreakdown(draft.options)} = {optionsStock}</span>}
            </label>
            <label className="grid gap-2 lg:col-span-2">
              <span className="text-sm font-bold text-on-surface">{t.categoryLabel}</span>
              <select className="input-field px-4 py-3 text-start" value={draft.categoryId} onChange={(event) => setDraft({ ...draft, categoryId: event.target.value })}>
                <option value="">{t.noCategory}</option>
                {categories.filter((c) => c.vendorId).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            <label className="grid gap-2">
              <RequiredLabel>{t.statusLabel}</RequiredLabel>
              <select className="input-field px-4 py-3 text-start" required value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as ProductStatus })}>
                <option value="ACTIVE">{t.active}</option>
                <option value="DRAFT">{t.draft}</option>
              </select>
            </label>
          </div>
          <label className="grid gap-2">
            <RequiredLabel>{t.productDescriptionLabel}</RequiredLabel>
            <textarea className="input-field min-h-28 px-4 py-3 text-start" dir="auto" required value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} />
          </label>
        </div>

        {/* Language-specific translations */}
        {addedLangs.map((lang) => {
          const meta = LANG_META[lang];
          const isAr = lang === "ar";
          return (
            <div key={lang} className="mt-3 grid gap-4 rounded-xl border border-outline-variant/20 p-3">
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-surface-container px-2.5 py-1 text-xs font-bold text-on-surface-variant">{meta.flag} {meta.label}</span>
                <button
                  type="button"
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-on-surface-variant hover:bg-error-container/30 hover:text-error transition-colors"
                  onClick={() => removeLang(lang)}
                >
                  <FiX className="h-4 w-4" />
                </button>
              </div>
              <div className="grid gap-4 lg:grid-cols-[1fr_160px]">
                <label className="grid gap-2">
                  <span className="text-sm font-bold text-on-surface">{t.productNameLabel}</span>
                  <input className="input-field px-4 py-3 text-start" dir={isAr ? "rtl" : "ltr"}
                    placeholder={isAr ? "مثال: حقيبة ماتشا" : "e.g. Matcha Rose"}
                    value={isAr ? draft.titleAr : draft.titleEn}
                    onChange={(e) => setDraft(isAr ? { ...draft, titleAr: e.target.value } : { ...draft, titleEn: e.target.value })} />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-bold text-on-surface">{t.productBadge}</span>
                  <input className="input-field px-4 py-3 text-start" dir={isAr ? "rtl" : "ltr"} maxLength={40}
                    placeholder={isAr ? "" : "e.g. New"}
                    value={isAr ? draft.badgeLabelAr : draft.badgeLabelEn}
                    onChange={(e) => setDraft(isAr ? { ...draft, badgeLabelAr: e.target.value } : { ...draft, badgeLabelEn: e.target.value })} />
                </label>
              </div>
              <label className="grid gap-2">
                <span className="text-sm font-bold text-on-surface">{t.productDescriptionLabel}</span>
                <textarea className="input-field min-h-28 px-4 py-3 text-start" dir={isAr ? "rtl" : "ltr"}
                  placeholder={isAr ? "" : "Describe your product in English..."}
                  value={isAr ? draft.descriptionAr : draft.descriptionEn}
                  onChange={(e) => setDraft(isAr ? { ...draft, descriptionAr: e.target.value } : { ...draft, descriptionEn: e.target.value })} />
              </label>
            </div>
          );
        })}

        <div className="mt-3">
          <AddLangButton addedLangs={addedLangs} onAdd={(lang) => setAddedLangs((prev) => [...prev, lang])} />
        </div>
      </div>
    </>
  );
}

export function ProductOptionsEditor({ options, onChange }: { options: ProductOptionDraft[]; onChange: (options: ProductOptionDraft[]) => void }) {
  const { t } = useI18n();
  const [addedLangs, setAddedLangs] = useState<string[]>(() => {
    const langs: string[] = [];
    if (options.some((o) => o.nameAr || o.values.some((v) => v.valueAr))) langs.push("ar");
    if (options.some((o) => o.nameEn || o.values.some((v) => v.valueEn))) langs.push("en");
    if (langs.length === 0) langs.push("ar", "en");
    return langs;
  });
  const showAr = addedLangs.includes("ar");
  const showEn = addedLangs.includes("en");

  function updateOption(index: number, input: Partial<ProductOptionDraft>) {
    onChange(options.map((option, optionIndex) => (optionIndex === index ? { ...option, ...input } : option)));
  }

  function updateOptionValue(optionIndex: number, valueIndex: number, input: Partial<ProductOptionDraft["values"][number]>) {
    onChange(
      options.map((option, currentOptionIndex) =>
        currentOptionIndex === optionIndex
          ? { ...option, values: option.values.map((value, currentValueIndex) => (currentValueIndex === valueIndex ? { ...value, ...input } : value)) }
          : option,
      ),
    );
  }

  function addOptionValue(optionIndex: number) {
    onChange(options.map((option, i) => (i === optionIndex ? { ...option, values: [...option.values, { value: "", valueAr: "", valueEn: "", quantity: "0", price: "" }] } : option)));
  }

  function removeOptionValue(optionIndex: number, valueIndex: number) {
    onChange(options.map((option, i) => (i === optionIndex ? { ...option, values: option.values.filter((_, vi) => vi !== valueIndex) } : option)));
  }

  function removeOption(index: number) {
    onChange(options.filter((_, i) => i !== index));
  }

  function removeLang(lang: string) {
    setAddedLangs((prev) => prev.filter((l) => l !== lang));
    if (lang === "ar") onChange(options.map((o) => ({ ...o, nameAr: "", values: o.values.map((v) => ({ ...v, valueAr: "" })) })));
    if (lang === "en") onChange(options.map((o) => ({ ...o, nameEn: "", values: o.values.map((v) => ({ ...v, valueEn: "" })) })));
  }

  const colCount = 1 + (showAr ? 1 : 0) + (showEn ? 1 : 0);
  const gridCols = colCount === 3
    ? "grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_112px_112px_44px]"
    : colCount === 2
    ? "grid-cols-[minmax(0,1fr)_minmax(0,1fr)_112px_112px_44px]"
    : "grid-cols-[minmax(0,1fr)_112px_112px_44px]";

  return (
    <section className="grid gap-3 rounded-xl bg-surface-container-low p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-black text-on-surface">{t.productVariantsTitle}</h3>
          <p className="mt-1 text-sm leading-6 text-on-surface-variant">{t.productVariantsDesc}</p>
        </div>
        <button className="secondary-button px-5 py-3" type="button" onClick={() => onChange([...options, { name: "", nameAr: "", nameEn: "", values: [{ value: "", valueAr: "", valueEn: "", quantity: "0", price: "" }] }])}>
          {t.addVariant}
        </button>
      </div>

      {options.length === 0 ? (
        <p className="rounded-xl bg-surface-container-lowest p-4 text-sm font-bold text-on-surface-variant">{t.noVariants}</p>
      ) : (
        <div className="grid gap-3">
          {options.map((option, index) => (
            <div key={index} className="grid gap-4 rounded-xl bg-surface-container-lowest p-3">
              {/* Option name row */}
              <div className="grid gap-2">
                <div className={`grid gap-2 ${colCount > 1 ? `sm:grid-cols-${colCount}` : ""}`}>
                  <div className="grid gap-1">
                    <span className="rounded-md bg-surface-container px-2 py-0.5 text-xs font-bold text-on-surface-variant w-fit">Default</span>
                    <input className="input-field px-4 py-3 text-start" placeholder={t.variantNamePlaceholder} value={option.name} onChange={(e) => updateOption(index, { name: e.target.value })} />
                  </div>
                  {showAr && (
                    <div className="grid gap-1">
                      <LangSectionLabel lang="ar" />
                      <input className="input-field px-4 py-3 text-start" dir="rtl" placeholder="مثال: اللون" value={option.nameAr} onChange={(e) => updateOption(index, { nameAr: e.target.value })} />
                    </div>
                  )}
                  {showEn && (
                    <div className="grid gap-1">
                      <LangSectionLabel lang="en" />
                      <input className="input-field px-4 py-3 text-start" dir="ltr" placeholder="e.g. Color" value={option.nameEn} onChange={(e) => updateOption(index, { nameEn: e.target.value })} />
                    </div>
                  )}
                </div>
              </div>

              {/* Values table */}
              <div className="grid gap-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-bold text-on-surface">{t.variantValuesTitle}</span>
                  <button className="secondary-button px-4 py-2 text-sm" type="button" onClick={() => addOptionValue(index)}>{t.addVariantValue}</button>
                </div>
                <div className="grid gap-2">
                  <div className={`grid gap-2 rounded-xl bg-surface-container-low p-2 text-xs font-black text-on-surface-variant ${gridCols}`}>
                    <span>Default</span>
                    {showAr && <LangSectionLabel lang="ar" />}
                    {showEn && <LangSectionLabel lang="en" />}
                    <span className="text-center">{t.variantStockLabel}</span>
                    <span className="text-center">{t.variantPriceLabel}</span>
                    <span aria-hidden="true" />
                  </div>
                  {option.values.map((item, valueIndex) => (
                    <div key={valueIndex} className={`grid gap-2 rounded-xl bg-surface-container-low p-2 ${gridCols}`}>
                      <input className="input-field px-4 py-3 text-start" placeholder={t.variantValuePlaceholder} value={item.value} onChange={(e) => updateOptionValue(index, valueIndex, { value: e.target.value })} />
                      {showAr && <input className="input-field px-4 py-3 text-start" dir="rtl" placeholder="مثال: أحمر" value={item.valueAr} onChange={(e) => updateOptionValue(index, valueIndex, { valueAr: e.target.value })} />}
                      {showEn && <input className="input-field px-4 py-3 text-start" dir="ltr" placeholder="e.g. Red" value={item.valueEn} onChange={(e) => updateOptionValue(index, valueIndex, { valueEn: e.target.value })} />}
                      <input className="input-field px-4 py-3 text-start" dir="ltr" min="0" placeholder={t.stockPlaceholder} type="number" value={item.quantity} onChange={(e) => updateOptionValue(index, valueIndex, { quantity: e.target.value })} />
                      <input className="input-field px-4 py-3 text-start" dir="ltr" min="0" placeholder={t.pricePlaceholder} step="0.01" type="number" value={item.price} onChange={(e) => updateOptionValue(index, valueIndex, { price: e.target.value })} />
                      <button className="flex h-11 w-11 items-center justify-center rounded-lg border border-error/30 p-0 text-[0px] font-bold text-error hover:bg-error-container/40" type="button" title={t.deleteVariantValue} aria-label={t.deleteVariantValue} onClick={() => removeOptionValue(index, valueIndex)}>
                        <FiTrash2 aria-hidden="true" className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button className="flex h-11 w-fit items-center gap-2 rounded-lg border border-error/30 px-4 py-2 text-sm font-bold text-error hover:bg-error-container/40" type="button" onClick={() => removeOption(index)}>
                <FiTrash2 aria-hidden="true" className="h-5 w-5" />
                {t.deleteVariant}
              </button>
            </div>
          ))}
        </div>
      )}

      {options.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <AddLangButton addedLangs={addedLangs} onAdd={(lang) => setAddedLangs((prev) => [...prev, lang])} />
          {showAr && (
            <button type="button" className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold text-error hover:bg-error-container/30 transition-colors" onClick={() => removeLang("ar")}>
              <FiX className="h-3 w-3" /> إزالة العربية
            </button>
          )}
          {showEn && (
            <button type="button" className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold text-error hover:bg-error-container/30 transition-colors" onClick={() => removeLang("en")}>
              <FiX className="h-3 w-3" /> Remove English
            </button>
          )}
        </div>
      )}
    </section>
  );
}

export function ProductAddonsEditor({ addons, onChange }: { addons: ProductAddonDraft[]; onChange: (addons: ProductAddonDraft[]) => void }) {
  const { t } = useI18n();
  const [addedLangs, setAddedLangs] = useState<string[]>(() => {
    const langs: string[] = [];
    if (addons.some((a) => a.nameAr)) langs.push("ar");
    if (addons.some((a) => a.nameEn)) langs.push("en");
    if (langs.length === 0) langs.push("ar", "en");
    return langs;
  });
  const showAr = addedLangs.includes("ar");
  const showEn = addedLangs.includes("en");
  const colCount = 1 + (showAr ? 1 : 0) + (showEn ? 1 : 0);
  const gridCols = colCount === 3
    ? "grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_120px_90px_44px]"
    : colCount === 2
    ? "grid-cols-[minmax(0,1fr)_minmax(0,1fr)_120px_90px_44px]"
    : "grid-cols-[minmax(0,1fr)_120px_90px_44px]";

  function updateAddon(index: number, input: Partial<ProductAddonDraft>) {
    onChange(addons.map((addon, i) => (i === index ? { ...addon, ...input } : addon)));
  }

  function removeAddon(index: number) {
    onChange(addons.filter((_, i) => i !== index));
  }

  function removeLang(lang: string) {
    setAddedLangs((prev) => prev.filter((l) => l !== lang));
    if (lang === "ar") onChange(addons.map((a) => ({ ...a, nameAr: "" })));
    if (lang === "en") onChange(addons.map((a) => ({ ...a, nameEn: "" })));
  }

  return (
    <section className="grid gap-3 rounded-xl bg-surface-container-low p-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h5 className="font-black text-on-surface">{t.productAddonsTitle}</h5>
          <p className="mt-1 text-sm leading-6 text-on-surface-variant">{t.productAddonsDesc}</p>
        </div>
        <button className="secondary-button px-5 py-3" type="button" onClick={() => onChange([...addons, { name: "", nameAr: "", nameEn: "", price: "0", enabled: true }])}>
          {t.add}
        </button>
      </div>

      {addons.length === 0 ? (
        <p className="rounded-xl bg-surface-container-lowest p-4 text-sm font-bold text-on-surface-variant">{t.noAddons}</p>
      ) : (
        <div className="grid gap-2">
          <div className={`grid gap-2 rounded-xl bg-surface-container-lowest p-2 text-xs font-black text-on-surface-variant ${gridCols}`}>
            <span>Default</span>
            {showAr && <LangSectionLabel lang="ar" />}
            {showEn && <LangSectionLabel lang="en" />}
            <span className="text-center">{t.addonPrice}</span>
            <span className="text-center">{t.addonEnabled}</span>
            <span aria-hidden="true" />
          </div>
          {addons.map((addon, index) => (
            <div key={index} className={`grid gap-2 rounded-xl bg-surface-container-lowest p-2 ${gridCols}`}>
              <input className="input-field px-4 py-3 text-start" placeholder={t.addonNamePlaceholder} value={addon.name} onChange={(e) => updateAddon(index, { name: e.target.value })} />
              {showAr && <input className="input-field px-4 py-3 text-start" dir="rtl" placeholder="مثال: تغليف هدية" value={addon.nameAr} onChange={(e) => updateAddon(index, { nameAr: e.target.value })} />}
              {showEn && <input className="input-field px-4 py-3 text-start" dir="ltr" placeholder="e.g. Gift wrapping" value={addon.nameEn} onChange={(e) => updateAddon(index, { nameEn: e.target.value })} />}
              <input className="input-field px-4 py-3 text-start" dir="ltr" min="0" step="0.01" type="number" value={addon.price} onChange={(e) => updateAddon(index, { price: e.target.value })} />
              <label className="flex items-center justify-center rounded-xl border border-outline-variant/30 bg-surface px-3 py-2">
                <input checked={addon.enabled} type="checkbox" onChange={(e) => updateAddon(index, { enabled: e.target.checked })} />
              </label>
              <button className="flex h-11 w-11 items-center justify-center rounded-lg border border-error/30 p-0 text-[0px] font-bold text-error hover:bg-error-container/40" type="button" title={t.deleteAddon} aria-label={t.deleteAddon} onClick={() => removeAddon(index)}>
                <FiTrash2 aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {addons.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <AddLangButton addedLangs={addedLangs} onAdd={(lang) => setAddedLangs((prev) => [...prev, lang])} />
          {showAr && <button type="button" className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold text-error hover:bg-error-container/30 transition-colors" onClick={() => removeLang("ar")}><FiX className="h-3 w-3" /> إزالة العربية</button>}
          {showEn && <button type="button" className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold text-error hover:bg-error-container/30 transition-colors" onClick={() => removeLang("en")}><FiX className="h-3 w-3" /> Remove English</button>}
        </div>
      )}
    </section>
  );
}

export function ProductImageUploader({
  imageUrls,
  onAddImage,
  onRemoveImage,
}: {
  imageUrls: string[];
  onAddImage: (url: string) => void;
  onRemoveImage: (url: string) => void;
}) {
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [manualUrl, setManualUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const previewUrls = useMemo(() => imageUrls.slice(0, 5), [imageUrls]);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);

    if (files.length === 0) {
      return;
    }

    setIsUploading(true);

    try {
      const token = readCookie("nmoo_access_token");
      for (const file of files) {
        const uploaded = await uploadProductImage(file, token);
        onAddImage(uploaded.url);
      }
    } catch (error) {
      window.alert(error instanceof ApiError ? error.message : t.imageUploadError);
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  }

  function handleAddManualUrl() {
    const nextUrl = manualUrl.trim();

    if (!nextUrl) {
      return;
    }

    onAddImage(nextUrl);
    setManualUrl("");
  }

  function handleManualUrlKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAddManualUrl();
    }
  }

  return (
    <section className="grid gap-3 rounded-xl bg-surface-container-low p-4">
      <div>
        <RequiredLabel>{t.productImagesLabel}</RequiredLabel>
        <p className="mt-1 text-sm leading-6 text-on-surface-variant">{t.productImagesDesc}</p>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
        <input ref={fileInputRef} className="sr-only" accept="image/png,image/jpeg,image/webp" multiple required={imageUrls.length === 0} type="file" onChange={handleFileChange} />
        <div className="input-field flex min-h-12 items-center justify-between gap-3 px-4 py-3 text-on-surface-variant">
          <span>{imageUrls.length > 0 ? t.imagesAdded(imageUrls.length) : t.noImagesSelected}</span>
          <span className="text-xs">PNG, JPG, WEBP</span>
        </div>
        <button className="secondary-button px-5 py-3 disabled:opacity-60" disabled={isUploading} type="button" onClick={() => fileInputRef.current?.click()}>
          {isUploading ? t.uploading : t.chooseImages}
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
        <input className="input-field px-4 py-3 text-right" dir="ltr" placeholder="https://example.com/product.jpg" value={manualUrl} onChange={(event) => setManualUrl(event.target.value)} onKeyDown={handleManualUrlKeyDown} />
        <button className="secondary-button px-5 py-3 disabled:opacity-60" disabled={!manualUrl.trim()} type="button" onClick={handleAddManualUrl}>
          {t.addImageUrl}
        </button>
      </div>

      {previewUrls.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {previewUrls.map((url) => (
            <div key={url} className="overflow-hidden rounded-xl border border-outline-variant/20 bg-surface-container-lowest">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt={t.productImageAlt} className="h-28 w-full object-cover" src={url} />
              <button className="flex w-full items-center justify-center px-3 py-2 text-[0px] font-bold text-error hover:bg-error-container/40" type="button" title={t.deleteImage} aria-label={t.deleteImage} onClick={() => onRemoveImage(url)}>
                <FiTrash2 aria-hidden="true" className="h-4 w-4" />
                {t.deleteImage}
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function ProductRow({ product, onDelete, onEdit }: { product: Product; onDelete: (product: Product) => void; onEdit: (product: Product) => void }) {
  const { t } = useI18n();
  const imageUrl = product.images?.[0]?.url ?? product.imageUrl;
  const hasDiscount = Boolean(product.hasDiscount && product.salePrice && Number(product.salePrice) < Number(product.price));

  return (
    <article className="grid gap-4 rounded-lg border border-outline-variant/15 bg-surface-container-lowest p-4 text-start lg:grid-cols-[96px_1fr_auto]">
      <div className="h-40 overflow-hidden rounded-lg bg-surface-container-low lg:h-24">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt={product.title} className="h-full w-full object-cover" src={imageUrl} />
        ) : null}
      </div>
      <div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h5 className="font-black text-on-surface">{product.title}</h5>
            <p className="mt-1 text-sm text-on-surface-variant">{product.description ?? t.noDescription}</p>
          </div>
          <StatusBadge status={product.status} />
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-sm font-bold text-on-surface-variant">
          <span className="rounded-full bg-surface-container-low px-3 py-1">{t.priceLabel}{formatPrice(Number(hasDiscount ? product.salePrice : product.price), t.currency, t.numberLocale)}</span>
          {hasDiscount ? <span className="rounded-full bg-red-100 px-3 py-1 text-red-700">{t.discountFrom}{formatPrice(Number(product.price), t.currency, t.numberLocale)}</span> : null}
          {!hasDiscount && product.badgeLabel ? <span className="rounded-full bg-primary-container/35 px-3 py-1 text-primary">{t.badgeLabel}{product.badgeLabel}</span> : null}
          <span className="rounded-full bg-surface-container-low px-3 py-1">{t.stockLabel}{product.stock}</span>
          <span className="rounded-full bg-surface-container-low px-3 py-1">{t.imagesLabel}{product.images?.length ?? 0}</span>
          <span className="rounded-full bg-surface-container-low px-3 py-1">{t.variantsLabel}{product.options?.length ?? 0}</span>
          <span className="rounded-full bg-surface-container-low px-3 py-1">{t.addonsLabel}{product.addons?.length ?? 0}</span>
          {product.category ? <span className="rounded-full bg-surface-container-low px-3 py-1">{product.category.name}</span> : null}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 lg:flex lg:flex-col">
        <Link className="secondary-button h-11 w-full p-0 text-[0px] lg:w-11" title={t.edit} aria-label={t.editProductAriaLabel(product.title)} href={`/dashboard/products/${product.id}`}>
          <FiEdit3 aria-hidden="true" className="h-5 w-5" />
          {t.edit}
        </Link>
        <button className="flex h-11 w-full items-center justify-center rounded-lg border border-error/30 p-0 text-[0px] font-bold text-error hover:bg-error-container/40 lg:w-11" type="button" title={t.delete} aria-label={t.deleteProductAriaLabel(product.title)} onClick={() => onDelete(product)}>
          <FiTrash2 aria-hidden="true" className="h-5 w-5" />
          {t.delete}
        </button>
      </div>
    </article>
  );
}

function DeletedProductsSection({ products, onRestore }: { products: Product[]; onRestore: (product: Product) => void }) {
  const { t } = useI18n();
  if (products.length === 0) {
    return null;
  }

  return (
    <div className="border-t border-outline-variant/15 p-4 text-start md:p-5">
      <DashboardAccordion
        title={t.archivedProductsTitle}
        description={t.archivedProductsDesc(products.length)}
      >
      <div className="grid gap-3">
        {products.map((product) => (
          <DeletedProductRow key={product.id} product={product} onRestore={onRestore} />
        ))}
      </div>
      </DashboardAccordion>
    </div>
  );
}

function DeletedProductRow({ product, onRestore }: { product: Product; onRestore: (product: Product) => void }) {
  const { t } = useI18n();
  const imageUrl = product.images?.[0]?.url ?? product.imageUrl;
  const remaining = getArchiveRemaining(product.archivedAt);

  return (
    <article className="grid gap-4 rounded-lg border border-red-200 bg-red-50/60 p-4 text-start lg:grid-cols-[88px_1fr_auto]">
      <div className="h-28 overflow-hidden rounded-lg bg-surface-container-low lg:h-20">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt={product.title} className="h-full w-full object-cover opacity-75 grayscale" src={imageUrl} />
        ) : null}
      </div>
      <div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h5 className="font-black text-on-surface">{product.title}</h5>
            <p className="mt-1 text-sm text-on-surface-variant">{product.description ?? t.noDescription}</p>
          </div>
          <StatusBadge status={product.status} />
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-sm font-bold text-on-surface-variant">
          <span className="rounded-full bg-white px-3 py-1">{t.stockLabel}{product.stock}</span>
          <span className="rounded-full bg-white px-3 py-1">{t.priceLabel}{formatPrice(Number(product.salePrice ?? product.price), t.currency, t.numberLocale)}</span>
          <span className={`rounded-full px-3 py-1 ${remaining.days <= 5 ? "bg-red-100 text-red-800" : "bg-white text-on-surface-variant"}`}>
            {remaining.expired ? t.expiredRestore : t.remainingDays(remaining.days)}
          </span>
        </div>
      </div>
      <button className="secondary-button h-11 px-5 py-2" type="button" onClick={() => onRestore(product)}>
        {t.restoreProduct}
      </button>
    </article>
  );
}

function StatusBadge({ status }: { status: ProductStatus }) {
  const { t } = useI18n();
  const labels: Record<ProductStatus, string> = {
    ACTIVE: t.active,
    DRAFT: t.draft,
    ARCHIVED: t.archived,
  };
  const classes: Record<ProductStatus, string> = {
    ACTIVE: "bg-green-100 text-green-800",
    DRAFT: "bg-amber-100 text-amber-800",
    ARCHIVED: "bg-red-100 text-red-800",
  };

  return <span className={`w-fit rounded-full px-3 py-1 text-sm font-bold ${classes[status]}`}>{labels[status]}</span>;
}

export function RequiredLabel({ children }: { children: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-start text-sm font-bold text-on-surface">
      <span>{children}</span>
      <span aria-hidden="true" className="text-error">*</span>
    </span>
  );
}

function readCookie(name: string) {
  const cookie = document.cookie
    .split("; ")
    .find((value) => value.startsWith(`${name}=`))
    ?.split("=")[1];

  return cookie ? decodeURIComponent(cookie) : "";
}

function formatPrice(value: number, currency = "ر.س", locale = "ar-SA") {
  return `${value.toLocaleString(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} ${currency}`;
}

function getArchiveRemaining(archivedAt?: string | null) {
  const archivedTime = archivedAt ? new Date(archivedAt).getTime() : Date.now();
  const expiresAt = archivedTime + 30 * 24 * 60 * 60 * 1000;
  const remainingMs = expiresAt - Date.now();
  const days = Math.max(0, Math.ceil(remainingMs / (24 * 60 * 60 * 1000)));

  return {
    days,
    expired: remainingMs <= 0,
  };
}

function sortCategories(first: Category, second: Category) {
  if (Boolean(first.vendorId) !== Boolean(second.vendorId)) {
    return first.vendorId ? 1 : -1;
  }

  return first.name.localeCompare(second.name, "ar");
}

function normalizeProductOptions(options: ProductOptionDraft[]) {
  return options
    .map((option) => {
      const values = Array.from(new Set(option.values.map((item) => item.value.trim()).filter(Boolean)));
      const valuesAr = option.values.map((item) => item.valueAr?.trim() ?? "");
      const valuesEn = option.values.map((item) => item.valueEn?.trim() ?? "");
      const valueQuantities = values.reduce<Record<string, number>>((result, value) => {
        const source = option.values.find((item) => item.value.trim() === value);
        const quantity = Number(source?.quantity ?? 0);
        result[value] = Number.isFinite(quantity) && quantity > 0 ? Math.floor(quantity) : 0;
        return result;
      }, {});
      const valuePrices = values.reduce<Record<string, number>>((result, value) => {
        const source = option.values.find((item) => item.value.trim() === value);
        const price = Number(source?.price);
        if (Number.isFinite(price) && price >= 0) {
          result[value] = Number(price.toFixed(2));
        }
        return result;
      }, {});

      return {
        name: option.name.trim(),
        nameAr: option.nameAr?.trim() || undefined,
        nameEn: option.nameEn?.trim() || undefined,
        values,
        valuesAr: valuesAr.some(Boolean) ? valuesAr : undefined,
        valuesEn: valuesEn.some(Boolean) ? valuesEn : undefined,
        valueQuantities,
        valuePrices,
      };
    })
    .filter((option) => option.name && option.values.length > 0);
}

function normalizeProductAddons(addons: ProductAddonDraft[]) {
  return addons
    .map((addon) => {
      const price = Number(addon.price);
      return {
        name: addon.name.trim(),
        nameAr: addon.nameAr?.trim() || undefined,
        nameEn: addon.nameEn?.trim() || undefined,
        price: Number.isFinite(price) && price >= 0 ? Number(price.toFixed(2)) : 0,
        enabled: addon.enabled,
      };
    })
    .filter((addon) => addon.name);
}

function calculateOptionsStock(options: ReturnType<typeof normalizeProductOptions>) {
  return options.reduce((total, option) => total + Object.values(option.valueQuantities).reduce((sum, quantity) => sum + quantity, 0), 0);
}

function calculateDraftOptionsStock(options: ProductOptionDraft[]) {
  return options.reduce(
    (total, option) =>
      total +
      option.values.reduce((sum, item) => {
        const quantity = Number(item.quantity);
        return sum + (Number.isFinite(quantity) && quantity > 0 ? Math.floor(quantity) : 0);
      }, 0),
    0,
  );
}

function hasDraftOptionQuantities(options: ProductOptionDraft[]) {
  return options.some((option) =>
    option.values.some((item) => {
      const quantity = Number(item.quantity);
      return Number.isFinite(quantity) && quantity > 0;
    }),
  );
}

function formatStockBreakdown(options: ProductOptionDraft[]) {
  const quantities = options.flatMap((option) =>
    option.values
      .map((item) => Number(item.quantity))
      .filter((quantity) => Number.isFinite(quantity) && quantity > 0)
      .map((quantity) => Math.floor(quantity)),
  );

  return quantities.length > 0 ? quantities.join(" + ") : "0";
}

function calculateProductStock(draft: ProductDraft) {
  const normalizedOptions = normalizeProductOptions(draft.options);
  return normalizedOptions.length > 0 ? calculateOptionsStock(normalizedOptions) : calculateDraftOptionsStock(draft.options) || Number(draft.stock);
}

export { calculateProductStock, normalizeProductAddons, normalizeProductOptions };
