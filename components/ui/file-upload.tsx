"use client";

import { useCallback, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/cn";

type Folder = "products" | "avatars" | "payments" | "verifications";

const ACCEPTED: Record<string, string[]> = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
};
const MAX_SIZE = 5 * 1024 * 1024; // 5MB — matches lib/storage.ts

/**
 * FileUpload — drag-and-drop image upload built on react-dropzone, layered on
 * the existing presigned-URL flow (browser PUTs directly to MinIO/S3). Shows a
 * dashed drop zone, per-file progress, thumbnail previews with remove buttons,
 * and client-side type/size validation in Bahasa Indonesia.
 *
 * `value`/`onChange` carry the public URL(s) — single (string) or multi (string[]).
 */
export function FileUpload({
  folder,
  multiple = false,
  value,
  onChange,
  label,
  help,
  disabled,
}: {
  folder: Folder;
  multiple?: boolean;
  value: string | string[];
  onChange: (urls: string | string[]) => void;
  label?: string;
  help?: string;
  disabled?: boolean;
}) {
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [error, setError] = useState("");

  const urls = useMemo(() => (Array.isArray(value) ? value : value ? [value] : []), [value]);

  const uploadOne = useCallback(
    async (file: File): Promise<string> => {
      const presignRes = await fetch("/api/uploads/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          folder,
          fileSize: file.size,
        }),
      });
      if (!presignRes.ok) {
        const body = await presignRes.json().catch(() => ({}));
        throw new Error(body.error ?? "Gagal membuat URL upload");
      }
      const { uploadUrl, publicUrl } = await presignRes.json();

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setProgress((p) => ({ ...p, [file.name]: Math.round((e.loaded / e.total) * 100) }));
          }
        };
        xhr.onload = () =>
          xhr.status >= 200 && xhr.status < 300
            ? resolve()
            : reject(new Error("Gagal upload file"));
        xhr.onerror = () => reject(new Error("Gagal upload file (jaringan)"));
        xhr.send(file);
      });
      return publicUrl;
    },
    [folder],
  );

  const onDrop = useCallback(
    async (accepted: File[]) => {
      setError("");
      const newUrls: string[] = [];
      for (const file of accepted) {
        try {
          const url = await uploadOne(file);
          newUrls.push(url);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Upload gagal");
        }
      }
      if (newUrls.length > 0) {
        const next = multiple ? [...urls.filter(Boolean), ...newUrls] : newUrls[0]!;
        onChange(next);
      }
      setProgress({});
    },
    [uploadOne, multiple, urls, onChange],
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    maxSize: MAX_SIZE,
    multiple,
    disabled,
    onDropRejected: (rejections) => {
      const r = rejections[0]?.errors[0];
      if (r?.code === "file-too-large")
        setError(`Ukuran file melebihi ${MAX_SIZE / 1024 / 1024}MB`);
      else if (r?.code === "file-invalid-type")
        setError("Format file tidak didukung (jpg, png, webp)");
      else setError("File tidak valid");
    },
  });

  function removeAt(idx: number) {
    const next = urls.filter((_, i) => i !== idx);
    onChange(multiple ? next : "");
  }

  return (
    <div className="space-y-2">
      {label && <span className="block text-sm font-medium text-foreground">{label}</span>}

      <div
        {...getRootProps()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-8 text-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy-700",
          isDragActive && !isDragReject && "border-brand-navy-700 bg-brand-navy-900/5",
          isDragReject && "border-danger bg-danger/5",
          !isDragActive &&
            "border-border bg-neutral-50 hover:border-brand-navy-700 hover:bg-brand-navy-900/5",
          disabled && "cursor-not-allowed opacity-60",
        )}
      >
        <input {...getInputProps()} />
        <UploadIcon
          className={cn("h-8 w-8", isDragActive ? "text-brand-navy-700" : "text-neutral-400")}
        />
        <p className="text-sm font-medium text-neutral-700">
          {isDragActive ? "Lepaskan file di sini" : "Seret & lepas, atau klik untuk memilih"}
        </p>
        <p className="text-xs text-neutral-500">
          JPG, PNG, WEBP · maks 5MB{multiple ? " · boleh banyak" : ""}
        </p>
      </div>

      {help && !error && <p className="text-xs text-neutral-500">{help}</p>}
      {error && (
        <p role="alert" className="text-xs font-medium text-danger">
          {error}
        </p>
      )}

      {/* Progress bars for files currently uploading */}
      {Object.entries(progress).map(([name, pct]) => (
        <div key={name} className="space-y-1">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span className="truncate">{name}</span>
            <span className="font-mono tabular-nums">{pct}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-neutral-200">
            <div
              className="h-full rounded-full bg-brand-navy-700 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      ))}

      {/* Preview grid */}
      {urls.length > 0 && (
        <div
          className={cn(
            "grid gap-2",
            multiple ? "grid-cols-3 sm:grid-cols-4" : "max-w-[160px] grid-cols-1",
          )}
        >
          {urls.map((url, idx) => (
            <div
              key={url + idx}
              className="group relative aspect-square overflow-hidden rounded-md border border-border bg-neutral-100"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Pratinjau ${idx + 1}`} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeAt(idx);
                }}
                aria-label="Hapus gambar"
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-brand-navy-900 text-white opacity-0 transition-opacity hover:bg-brand-navy-700 focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold-300 group-hover:opacity-100"
              >
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 16V4m0 0L8 8m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"
      />
    </svg>
  );
}
