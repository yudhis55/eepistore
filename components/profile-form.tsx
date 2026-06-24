"use client";

import { useActionState, useState } from "react";
import { updateProfileAction, type ProfileActionState } from "@/features/profile/actions";

type Profile = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
};

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, formAction, pending] = useActionState<ProfileActionState, FormData>(
    updateProfileAction,
    {},
  );

  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError("");

    try {
      const res = await fetch("/api/uploads/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          folder: "avatars",
          fileSize: file.size,
        }),
      });

      if (!res.ok) throw new Error("Gagal generate upload URL");
      const { uploadUrl, publicUrl } = await res.json();

      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (!uploadRes.ok) throw new Error("Gagal upload file");
      setAvatarUrl(publicUrl);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload gagal");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form action={formAction} className="space-y-4">
      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-brand-navy-900 text-white">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
          ) : (
            <span className="text-2xl font-bold">{profile.name[0]}</span>
          )}
        </div>
        <div>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleAvatarUpload}
            disabled={uploading}
            className="text-xs"
          />
          {uploading && <p className="text-xs text-neutral-500">Mengupload...</p>}
          {uploadError && <p className="text-xs text-danger">{uploadError}</p>}
        </div>
        <input type="hidden" name="avatarUrl" value={avatarUrl} />
      </div>

      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium">
          Nama
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={profile.name}
          className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-navy-700"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Email</label>
        <p className="text-sm text-neutral-500">{profile.email}</p>
      </div>

      <div>
        <label htmlFor="phone" className="mb-1 block text-sm font-medium">
          No. HP
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={profile.phone ?? ""}
          className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-navy-700"
        />
      </div>

      {state.error && (
        <p className="rounded bg-danger/10 px-3 py-2 text-sm text-danger">{state.error}</p>
      )}
      {state.success && (
        <p className="rounded bg-success/10 px-3 py-2 text-sm text-success">Profil diperbarui.</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand-navy-900 px-4 py-2 font-medium text-white hover:bg-brand-navy-700 disabled:opacity-50"
      >
        {pending ? "Menyimpan..." : "Simpan"}
      </button>
    </form>
  );
}
