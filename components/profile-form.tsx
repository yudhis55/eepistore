"use client";

import { useActionState, useState } from "react";
import { updateProfileAction, type ProfileActionState } from "@/features/profile/actions";
import { FileUpload } from "@/components/ui/file-upload";
import { Input, FormField } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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

  return (
    <form action={formAction} className="space-y-4">
      <FileUpload
        folder="avatars"
        value={avatarUrl}
        onChange={(v) => setAvatarUrl(typeof v === "string" ? v : (v[0] ?? ""))}
        label="Foto Profil"
        help="JPG, PNG, atau WEBP."
      />
      <input type="hidden" name="avatarUrl" value={avatarUrl} />

      <FormField label="Nama" htmlFor="name" required>
        <Input id="name" name="name" type="text" required defaultValue={profile.name} />
      </FormField>

      <div>
        <span className="block text-sm font-medium text-foreground">Email</span>
        <p className="mt-1.5 text-sm text-neutral-500">{profile.email}</p>
      </div>

      <FormField label="No. HP" htmlFor="phone">
        <Input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={profile.phone ?? ""}
          placeholder="08xxxxxxxxxx"
        />
      </FormField>

      {state.error && (
        <p
          role="alert"
          className="rounded-md bg-danger/10 px-3 py-2 text-sm font-medium text-danger"
        >
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rounded-md bg-success/10 px-3 py-2 text-sm text-success">
          Profil diperbarui.
        </p>
      )}

      <Button type="submit" loading={pending} className="w-full sm:w-auto">
        Simpan
      </Button>
    </form>
  );
}
