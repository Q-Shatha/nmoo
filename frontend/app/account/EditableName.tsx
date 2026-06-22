"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";
import { ApiError, ApiUser, updateMyProfile } from "@/lib/api";
import { useI18n } from "@/lib/i18n/context";

type EditableNameProps = {
  user: ApiUser;
};

export function EditableName({ user }: EditableNameProps) {
  const { t } = useI18n();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [draftName, setDraftName] = useState(user.name);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function cancelEdit() {
    setDraftName(name);
    setMessage("");
    setIsEditing(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextName = draftName.trim();

    if (nextName.length < 2) {
      setMessage(t.nameTooShort);
      return;
    }

    startTransition(async () => {
      try {
        const updatedUser = await updateMyProfile({ name: nextName }, getToken());
        setName(updatedUser.name);
        setDraftName(updatedUser.name);
        setMessage(t.nameUpdated);
        setIsEditing(false);
        router.refresh();
      } catch (error) {
        setMessage(error instanceof ApiError ? error.message : t.failedToUpdateName);
      }
    });
  }

  if (isEditing) {
    return (
      <form className="mt-1 grid w-full min-w-0 gap-2 sm:flex sm:flex-row sm:items-center" onSubmit={handleSubmit}>
        <label className="sr-only" htmlFor="account-name">
          {t.name}
        </label>
        <input
          className="min-h-12 w-full min-w-0 rounded-2xl border border-outline-variant bg-surface px-4 text-start text-xl font-black text-on-surface outline-none transition focus:border-primary sm:w-auto sm:min-w-72"
          disabled={isPending}
          id="account-name"
          maxLength={120}
          minLength={2}
          onChange={(event) => setDraftName(event.target.value)}
          value={draftName}
        />
        <div className="flex w-full justify-end gap-2 sm:w-auto">
          <button className="primary-button min-w-20 px-4 py-2 text-sm" disabled={isPending} type="submit">
            {t.save}
          </button>
          <button className="secondary-button min-w-20 px-4 py-2 text-sm" disabled={isPending} onClick={cancelEdit} type="button">
            {t.cancel}
          </button>
        </div>
        {message ? <p className="text-sm font-bold text-primary sm:ms-2">{message}</p> : null}
      </form>
    );
  }

  return (
    <div className="mt-1">
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-black text-on-surface">{name}</h2>
        <button
          aria-label={t.editNameLabel}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-outline-variant bg-surface text-primary transition hover:bg-primary-container hover:text-on-primary-container"
          onClick={() => {
            setMessage("");
            setIsEditing(true);
          }}
          type="button"
        >
          <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
            <path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0 0-3L17.5 5.5a2.1 2.1 0 0 0-3 0L4 16v4Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            <path d="m13.5 6.5 4 4" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
          </svg>
        </button>
      </div>
      {message ? <p className="mt-2 text-sm font-bold text-primary">{message}</p> : null}
    </div>
  );
}

function getToken() {
  const token = document.cookie
    .split("; ")
    .find((item) => item.startsWith("nmoo_access_token="))
    ?.split("=")[1];

  return token ? decodeURIComponent(token) : "";
}
