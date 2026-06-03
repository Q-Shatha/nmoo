"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, Category, createCategory, createProduct, ProductStatus } from "@/lib/api";
import { normalizeProductOptions, ProductDraft, ProductFields, ProductImageUploader, ProductOptionsEditor } from "../../DashboardProductManager";

const emptyDraft: ProductDraft = {
  title: "",
  description: "",
  badgeLabel: "",
  price: "",
  discountType: "",
  discountValue: "",
  stock: "0",
  categoryId: "",
  status: "ACTIVE" as ProductStatus,
  imageUrls: [],
  options: [],
};

export function AddProductForm({ categories: initialCategories }: { categories: Category[] }) {
  const router = useRouter();
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
      setCategories((current) => [...current, category].sort((first, second) => first.name.localeCompare(second.name, "ar")));
      setDraft((current) => ({
        ...current,
        categoryId: category.id,
      }));
      setNewCategoryName("");
      setMessage("تمت إضافة التصنيف الخاص واختياره للمنتج.");
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "تعذر إضافة التصنيف.");
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

      router.push("/dashboard/products");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "تعذر إضافة المنتج.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="dashboard-panel grid gap-6 p-6 text-right" dir="rtl" onSubmit={handleSubmit}>
      <section className="grid gap-5 rounded-xl bg-surface-container-low p-4 text-right" dir="rtl">
        <div>
          <h2 className="text-lg font-black text-on-surface">بيانات المنتج</h2>
          <p className="mt-1 text-sm leading-6 text-on-surface-variant">اكتب بيانات واضحة تساعد العميل على فهم المنتج قبل الشراء.</p>
        </div>
        <ProductFields categories={categories} draft={draft} setDraft={setDraft} />
      </section>

      <ProductOptionsEditor options={draft.options} onChange={(options) => setDraft({ ...draft, options })} />

      <section className="grid gap-3 rounded-xl bg-surface-container-low p-4 text-right" dir="rtl">
        <div>
          <h2 className="text-lg font-black text-on-surface">تصنيف خاص بالتاجر</h2>
          <p className="mt-1 text-sm leading-6 text-on-surface-variant">إذا لم تجد التصنيف المناسب، أضف تصنيفا خاصا بمتجرك وسيظهر في قائمة التصنيفات.</p>
        </div>
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <input
            className="input-field px-4 py-3 text-right"
            dir="rtl"
            placeholder="مثال: عطور منزلية"
            value={newCategoryName}
            onChange={(event) => setNewCategoryName(event.target.value)}
          />
          <button className="secondary-button px-5 py-3 disabled:opacity-60" disabled={isCreatingCategory || !newCategoryName.trim()} type="button" onClick={handleCreateCategory}>
            {isCreatingCategory ? "جاري الإضافة..." : "إضافة التصنيف"}
          </button>
        </div>
      </section>

      <ProductImageUploader imageUrls={draft.imageUrls} onAddImage={addImageUrl} onRemoveImage={removeImageUrl} />

      {message ? <p className="rounded-xl bg-surface-container-low px-4 py-3 text-sm font-bold text-on-surface">{message}</p> : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button className="primary-button px-8 py-4 disabled:opacity-60" disabled={isSaving} type="submit">
          {isSaving ? "جاري إضافة المنتج..." : "إضافة المنتج"}
        </button>
        <button className="secondary-button px-8 py-4" type="button" onClick={() => router.push("/dashboard/products")}>
          رجوع للمنتجات
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
