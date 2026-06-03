"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, KeyboardEvent, useMemo, useRef, useState } from "react";
import { ApiError, Category, deleteProduct, DiscountType, Product, ProductStatus, updateProduct, uploadProductImage } from "@/lib/api";

type ProductDraft = {
  title: string;
  description: string;
  badgeLabel: string;
  price: string;
  discountType: DiscountType | "";
  discountValue: string;
  stock: string;
  categoryId: string;
  status: ProductStatus;
  imageUrls: string[];
  options: ProductOptionDraft[];
};

type ProductOptionDraft = {
  name: string;
  valuesText: string;
};

export function DashboardProductManager({ categories, initialProducts }: { categories: Category[]; initialProducts: Product[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [draft, setDraft] = useState<ProductDraft | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  function startEdit(product: Product) {
    setEditingProduct(product);
    setDraft({
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
      options: product.options?.map((option) => ({ name: option.name, valuesText: option.values.join("، ") })) ?? [],
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
          description: draft.description,
          badgeLabel: draft.badgeLabel,
          price: Number(draft.price),
          discountType: draft.discountType || undefined,
          discountValue: draft.discountType ? Number(draft.discountValue || 0) : 0,
          stock: Number(draft.stock),
          categoryId: draft.categoryId || undefined,
          imageUrl: draft.imageUrls[0] || undefined,
          imageUrls: draft.imageUrls,
          options: normalizeProductOptions(draft.options),
          status: draft.status,
        },
        token,
      );

      setProducts((current) => current.map((item) => (item.id === product.id ? product : item)));
      resetEdit();
      setMessage("تم تحديث المنتج.");
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "تعذر تحديث المنتج.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(product: Product) {
    const confirmed = window.confirm(`حذف المنتج "${product.title}"؟`);

    if (!confirmed) {
      return;
    }

    setMessage("");

    try {
      const token = readCookie("nmoo_access_token");
      await deleteProduct(product.id, token);
      setProducts((current) => current.filter((item) => item.id !== product.id));
      if (editingProduct?.id === product.id) {
        resetEdit();
      }
      setMessage("تم حذف المنتج من القائمة.");
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "تعذر حذف المنتج.");
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
      <div className="flex flex-col gap-4 border-b border-outline-variant/15 p-5 text-right sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h4 className="text-xl font-black text-on-surface">إدارة المنتجات</h4>
          <p className="mt-1 text-sm text-on-surface-variant">راجع منتجاتك وعدل بياناتها أو احذفها. إضافة منتج جديد تتم من صفحة مخصصة.</p>
        </div>
        <Link className="primary-button px-6 py-3" href="/dashboard/products/new">
          إضافة منتج
        </Link>
      </div>

      {draft && editingProduct ? (
        <form className="grid gap-5 border-b border-outline-variant/15 p-5 text-right" dir="rtl" onSubmit={handleUpdate}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h5 className="text-lg font-black text-on-surface">تعديل المنتج</h5>
            <button className="secondary-button px-5 py-2" type="button" onClick={resetEdit}>
              إلغاء التعديل
            </button>
          </div>

          <ProductFields categories={categories} draft={draft} setDraft={setDraft} />
          <ProductOptionsEditor options={draft.options} onChange={(options) => setDraft({ ...draft, options })} />
          <ProductImageUploader imageUrls={draft.imageUrls} onAddImage={addImageUrl} onRemoveImage={removeImageUrl} />

          <button className="primary-button w-full py-4 disabled:opacity-60 sm:w-fit sm:px-8" disabled={isSaving} type="submit">
            {isSaving ? "جاري الحفظ..." : "حفظ التعديل"}
          </button>
        </form>
      ) : null}

      {message ? <p className="mx-5 mt-5 rounded-xl bg-surface-container-low px-4 py-3 text-sm font-bold text-on-surface">{message}</p> : null}

      <div className="grid gap-3 p-5">
        {products.length === 0 ? (
          <p className="py-6 text-center font-bold text-on-surface-variant">لا توجد منتجات بعد.</p>
        ) : (
          products.map((product) => <ProductRow key={product.id} product={product} onDelete={handleDelete} onEdit={startEdit} />)
        )}
      </div>
    </section>
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
  return (
    <>
      <div className="grid gap-4 text-right lg:grid-cols-6" dir="rtl">
        <label className="grid gap-2 lg:col-span-2">
          <RequiredLabel>اسم المنتج</RequiredLabel>
          <input className="input-field px-4 py-3 text-right" dir="rtl" required value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-bold text-on-surface">شارة المنتج</span>
          <input
            className="input-field px-4 py-3 text-right"
            dir="rtl"
            maxLength={40}
            placeholder="مثال: جديد"
            value={draft.badgeLabel}
            onChange={(event) => setDraft({ ...draft, badgeLabel: event.target.value })}
          />
        </label>
        <label className="grid gap-2">
          <RequiredLabel>السعر</RequiredLabel>
          <input className="input-field px-4 py-3 text-right" dir="ltr" min="0" required step="0.01" type="number" value={draft.price} onChange={(event) => setDraft({ ...draft, price: event.target.value })} />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-bold text-on-surface">نوع الخصم</span>
          <select
            className="input-field px-4 py-3 text-right"
            dir="rtl"
            value={draft.discountType}
            onChange={(event) => setDraft({ ...draft, discountType: event.target.value as DiscountType | "", discountValue: event.target.value ? draft.discountValue : "" })}
          >
            <option value="">بدون خصم</option>
            <option value="PERCENTAGE">نسبة مئوية</option>
            <option value="FIXED">مبلغ ثابت</option>
          </select>
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-bold text-on-surface">قيمة الخصم</span>
          <input
            className="input-field px-4 py-3 text-right disabled:opacity-50"
            dir="ltr"
            disabled={!draft.discountType}
            max={draft.discountType === "PERCENTAGE" ? "100" : undefined}
            min="0"
            step="0.01"
            type="number"
            value={draft.discountValue}
            onChange={(event) => setDraft({ ...draft, discountValue: event.target.value })}
          />
        </label>
        <label className="grid gap-2">
          <RequiredLabel>الكمية</RequiredLabel>
          <input className="input-field px-4 py-3 text-right" dir="ltr" min="0" required type="number" value={draft.stock} onChange={(event) => setDraft({ ...draft, stock: event.target.value })} />
        </label>
        <label className="grid gap-2 lg:col-span-2">
          <span className="text-sm font-bold text-on-surface">التصنيف</span>
          <select className="input-field px-4 py-3 text-right" dir="rtl" value={draft.categoryId} onChange={(event) => setDraft({ ...draft, categoryId: event.target.value })}>
            <option value="">بدون تصنيف</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.vendorId ? `${category.name} - خاص` : category.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2">
          <RequiredLabel>الحالة</RequiredLabel>
          <select className="input-field px-4 py-3 text-right" required value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as ProductStatus })}>
            <option value="ACTIVE">نشط</option>
            <option value="DRAFT">مسودة</option>
          </select>
        </label>
      </div>

      <label className="grid gap-2">
        <RequiredLabel>شرح المنتج</RequiredLabel>
        <textarea className="input-field min-h-28 px-4 py-3 text-right" dir="rtl" required value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} />
      </label>
    </>
  );
}

export function ProductOptionsEditor({ options, onChange }: { options: ProductOptionDraft[]; onChange: (options: ProductOptionDraft[]) => void }) {
  function updateOption(index: number, input: Partial<ProductOptionDraft>) {
    onChange(options.map((option, optionIndex) => (optionIndex === index ? { ...option, ...input } : option)));
  }

  function removeOption(index: number) {
    onChange(options.filter((_, optionIndex) => optionIndex !== index));
  }

  return (
    <section className="grid gap-3 rounded-xl bg-surface-container-low p-4 text-right" dir="rtl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-black text-on-surface">أنواع المنتج</h3>
          <p className="mt-1 text-sm leading-6 text-on-surface-variant">أضف خيارات يختار منها العميل، مثل اللون أو الحجم. اكتب القيم مفصولة بفواصل.</p>
        </div>
        <button className="secondary-button px-5 py-3" type="button" onClick={() => onChange([...options, { name: "", valuesText: "" }])}>
          إضافة نوع
        </button>
      </div>

      {options.length === 0 ? (
        <p className="rounded-xl bg-surface-container-lowest p-4 text-sm font-bold text-on-surface-variant">لا توجد أنواع مضافة بعد.</p>
      ) : (
        <div className="grid gap-3">
          {options.map((option, index) => (
            <div key={index} className="grid gap-3 rounded-xl bg-surface-container-lowest p-3 lg:grid-cols-[180px_1fr_auto]">
              <label className="grid gap-2">
                <span className="text-sm font-bold text-on-surface">اسم النوع</span>
                <input className="input-field px-4 py-3 text-right" dir="rtl" placeholder="مثال: اللون" value={option.name} onChange={(event) => updateOption(index, { name: event.target.value })} />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-bold text-on-surface">القيم</span>
                <input
                  className="input-field px-4 py-3 text-right"
                  dir="rtl"
                  placeholder="أحمر، أزرق، أسود"
                  value={option.valuesText}
                  onChange={(event) => updateOption(index, { valuesText: event.target.value })}
                />
              </label>
              <button className="self-end rounded-lg border border-error/30 px-5 py-3 font-bold text-error hover:bg-error-container/40" type="button" onClick={() => removeOption(index)}>
                حذف
              </button>
            </div>
          ))}
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
      window.alert(error instanceof ApiError ? error.message : "تعذر رفع الصورة.");
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
    <section className="grid gap-3 rounded-xl bg-surface-container-low p-4 text-right" dir="rtl">
      <div>
        <RequiredLabel>صور المنتج</RequiredLabel>
        <p className="mt-1 text-sm leading-6 text-on-surface-variant">ارفع الصور من جهازك، وسيتم إرسالها إلى الباك إند ثم رفعها إلى S3.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
        <input ref={fileInputRef} className="sr-only" accept="image/png,image/jpeg,image/webp" multiple required={imageUrls.length === 0} type="file" onChange={handleFileChange} />
        <div className="input-field flex min-h-12 items-center justify-between gap-3 px-4 py-3 text-right text-on-surface-variant">
          <span>{imageUrls.length > 0 ? `${imageUrls.length} صورة مضافة` : "لم يتم اختيار صور بعد"}</span>
          <span className="text-xs">PNG, JPG, WEBP</span>
        </div>
        <button className="secondary-button px-5 py-3 disabled:opacity-60" disabled={isUploading} type="button" onClick={() => fileInputRef.current?.click()}>
          {isUploading ? "جاري الرفع..." : "اختر الصور"}
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
        <input className="input-field px-4 py-3 text-right" dir="ltr" placeholder="https://example.com/product.jpg" value={manualUrl} onChange={(event) => setManualUrl(event.target.value)} onKeyDown={handleManualUrlKeyDown} />
        <button className="secondary-button px-5 py-3 disabled:opacity-60" disabled={!manualUrl.trim()} type="button" onClick={handleAddManualUrl}>
          إضافة رابط
        </button>
      </div>

      {previewUrls.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {previewUrls.map((url) => (
            <div key={url} className="overflow-hidden rounded-xl border border-outline-variant/20 bg-surface-container-lowest">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt="صورة المنتج" className="h-28 w-full object-cover" src={url} />
              <button className="w-full px-3 py-2 text-sm font-bold text-error hover:bg-error-container/40" type="button" onClick={() => onRemoveImage(url)}>
                حذف الصورة
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function ProductRow({ product, onDelete, onEdit }: { product: Product; onDelete: (product: Product) => void; onEdit: (product: Product) => void }) {
  const imageUrl = product.images?.[0]?.url ?? product.imageUrl;
  const hasDiscount = Boolean(product.hasDiscount && product.salePrice && Number(product.salePrice) < Number(product.price));

  return (
    <article className="grid gap-4 rounded-lg border border-outline-variant/15 bg-surface-container-lowest p-4 text-right lg:grid-cols-[96px_1fr_auto]">
      <div className="h-24 overflow-hidden rounded-lg bg-surface-container-low">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt={product.title} className="h-full w-full object-cover" src={imageUrl} />
        ) : null}
      </div>
      <div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h5 className="font-black text-on-surface">{product.title}</h5>
            <p className="mt-1 text-sm text-on-surface-variant">{product.description ?? "لا يوجد وصف."}</p>
          </div>
          <StatusBadge status={product.status} />
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-sm font-bold text-on-surface-variant">
          <span className="rounded-full bg-surface-container-low px-3 py-1">السعر: {formatPrice(Number(hasDiscount ? product.salePrice : product.price))}</span>
          {hasDiscount ? <span className="rounded-full bg-green-100 px-3 py-1 text-green-800">خصم من {formatPrice(Number(product.price))}</span> : null}
          {!hasDiscount && product.badgeLabel ? <span className="rounded-full bg-primary-container/35 px-3 py-1 text-primary">الشارة: {product.badgeLabel}</span> : null}
          <span className="rounded-full bg-surface-container-low px-3 py-1">الكمية: {product.stock}</span>
          <span className="rounded-full bg-surface-container-low px-3 py-1">الصور: {product.images?.length ?? 0}</span>
          <span className="rounded-full bg-surface-container-low px-3 py-1">الأنواع: {product.options?.length ?? 0}</span>
          {product.category ? <span className="rounded-full bg-surface-container-low px-3 py-1">{product.category.name}</span> : null}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <button className="secondary-button px-5 py-2" type="button" onClick={() => onEdit(product)}>
          تعديل
        </button>
        <button className="rounded-lg border border-error/30 px-5 py-2 font-bold text-error hover:bg-error-container/40" type="button" onClick={() => onDelete(product)}>
          حذف
        </button>
      </div>
    </article>
  );
}

function StatusBadge({ status }: { status: ProductStatus }) {
  const labels: Record<ProductStatus, string> = {
    ACTIVE: "نشط",
    DRAFT: "مسودة",
    ARCHIVED: "محذوف",
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
    <span className="inline-flex flex-row-reverse items-center justify-end gap-1 text-right text-sm font-bold text-on-surface" dir="rtl">
      <span aria-hidden="true" className="text-error">
        *
      </span>
      <span>{children}</span>
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

function formatPrice(value: number) {
  return `${value.toLocaleString("ar-SA", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} ر.س`;
}

function normalizeProductOptions(options: ProductOptionDraft[]) {
  return options
    .map((option) => ({
      name: option.name.trim(),
      values: option.valuesText
        .split(/[,،\n]/)
        .map((value) => value.trim())
        .filter(Boolean),
    }))
    .filter((option) => option.name && option.values.length > 0);
}

export { normalizeProductOptions };
export type { ProductDraft, ProductOptionDraft };
