"use client";

import Image from "next/image";
import { ChangeEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, ApiUser, uploadMyAvatar } from "@/lib/api";

export function AvatarSettings({ user }: { user: ApiUser }) {
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl ?? "");
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setMessage("");
    setIsUploading(true);

    try {
      const token = readCookie("nmoo_access_token");
      const updatedUser = await uploadMyAvatar(file, token);
      setAvatarUrl(updatedUser.avatarUrl ?? "");
      setMessage("تم تحديث صورة الحساب.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "تعذر رفع صورة الحساب.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <section className="rounded-xl bg-surface-container-low p-5 text-right">
      <div className="flex items-center gap-4">
        <div className="relative h-20 w-20 shrink-0">
          <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-primary-container text-3xl font-black text-on-primary-container">
            {avatarUrl ? <Image alt={user.name} className="object-cover" src={avatarUrl} fill sizes="80px" unoptimized /> : user.name.trim()[0] ?? "ن"}
          </div>
          <label className="absolute bottom-0 left-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-surface-container-low bg-primary text-on-primary shadow-sm transition hover:bg-primary/90" title="تغيير صورة الحساب" aria-label="تغيير صورة الحساب">
            {isUploading ? <span className="h-3 w-3 animate-pulse rounded-full bg-current" aria-hidden="true" /> : <CameraIcon />}
            <input className="sr-only" accept="image/png,image/jpeg,image/webp" disabled={isUploading} type="file" onChange={handleUpload} />
          </label>
        </div>

        <div>
          <h3 className="text-xl font-black text-on-surface">صورة الحساب</h3>
          <p className="mt-1 text-sm leading-7 text-on-surface-variant">تظهر صورتك بجانب مراجعاتك وفي حسابك.</p>
          <span className="mt-1 block text-xs font-bold text-on-surface-variant">{isUploading ? "جاري رفع الصورة..." : "اضغط أيقونة الكاميرا لتغيير الصورة"}</span>
        </div>
      </div>

      {message ? <p className="mt-4 rounded-xl bg-surface-container-lowest px-4 py-3 text-sm font-bold text-on-surface-variant">{message}</p> : null}
    </section>
  );
}

function CameraIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" viewBox="0 0 24 24">
      <path d="M14.5 5.5 13 3H9L7.5 5.5H5a3 3 0 0 0-3 3V18a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V8.5a3 3 0 0 0-3-3z" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  );
}

function readCookie(name: string) {
  const cookie = document.cookie
    .split("; ")
    .find((value) => value.startsWith(`${name}=`))
    ?.split("=")[1];

  return cookie ? decodeURIComponent(cookie) : "";
}
