"use client";

import { useActionState, useState } from "react";
import { createBannerAction, type BannerActionState } from "@/features/banner/actions";
import { FileUpload } from "@/components/ui/file-upload";
import { Input, FormField } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function BannerForm() {
  const [state, formAction, pending] = useActionState<BannerActionState, FormData>(
    createBannerAction,
    {},
  );
  const [imageUrl, setImageUrl] = useState("");

  return (
    <form action={formAction} className="space-y-3">
      <FormField label="Judul" htmlFor="title" required>
        <Input id="title" name="title" type="text" required />
      </FormField>

      <FileUpload
        folder="products"
        value={imageUrl}
        onChange={(v) => setImageUrl(typeof v === "string" ? v : (v[0] ?? ""))}
        label="Gambar Banner"
        help="Rasio landscape direkomendasikan (mis. 600×200)."
      />
      <input type="hidden" name="imageUrl" value={imageUrl} />

      <FormField label="Link URL (opsional)" htmlFor="linkUrl">
        <Input id="linkUrl" name="linkUrl" type="url" placeholder="/products" />
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Posisi" htmlFor="position">
          <Input id="position" name="position" type="number" min="0" defaultValue={0} />
        </FormField>
        <div className="flex items-end pb-2">
          <label className="flex min-h-11 items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isActive"
              value="true"
              defaultChecked
              className="h-4 w-4 rounded border-border accent-brand-navy-900"
            />
            Aktif
          </label>
        </div>
      </div>

      {state.error && (
        <p
          role="alert"
          className="rounded-md bg-danger/10 px-3 py-2 text-sm font-medium text-danger"
        >
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rounded-md bg-success/10 px-3 py-2 text-sm text-success">Banner dibuat.</p>
      )}

      <Button type="submit" loading={pending} disabled={!imageUrl} className="w-full sm:w-auto">
        Simpan Banner
      </Button>
    </form>
  );
}
