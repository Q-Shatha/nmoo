"use client";

import Image from "next/image";
import { ChangeEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, ApiUser, uploadMyAvatar } from "@/lib/api";
import { useI18n } from "@/lib/i18n/context";

type AccountAvatarProps = {
  user: ApiUser;
};

export function AccountAvatar({ user }: AccountAvatarProps) {
  const { t } = useI18n();
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl ?? "");
  const [isUploading, setIsUploading] = useState(false);

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setIsUploading(true);

    try {
      const updatedUser = await uploadMyAvatar(file, readCookie("nmoo_access_token"));
      setAvatarUrl(updatedUser.avatarUrl ?? "");
      router.refresh();
    } catch (error) {
      alert(error instanceof ApiError ? error.message : t.failedToUploadAvatar);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="relative h-16 w-16 shrink-0">
      <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-primary-container text-2xl font-black text-on-primary-container">
        {avatarUrl ? <Image alt={user.name} className="object-cover" src={avatarUrl} fill sizes="64px" unoptimized /> : user.name.trim()[0] ?? "ن"}
      </div>
      <label className="absolute bottom-0 left-0 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-2 border-surface bg-primary text-on-primary shadow-sm transition hover:bg-primary/90" title={t.changeAvatarLabel} aria-label={t.changeAvatarLabel}>
        {isUploading ? <span className="h-3 w-3 animate-pulse rounded-full bg-current" aria-hidden="true" /> : <CameraIcon />}
        <input className="sr-only" accept="image/png,image/jpeg,image/webp" disabled={isUploading} type="file" onChange={handleUpload} />
      </label>
    </div>
  );
}

function CameraIcon() {
  return (
    <svg aria-hidden="true" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" viewBox="0 0 24 24">
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
