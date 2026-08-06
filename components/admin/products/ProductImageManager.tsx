"use client";

import { useState, useEffect } from "react";
import { upload } from "@vercel/blob/client";
import { toPublicImageUrl } from "@/lib/blob";
import { UploadCloud, X, ChevronUp, ChevronDown, Loader2, AlertCircle, GripVertical } from "lucide-react";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB

export interface ProductImageValue {
  url: string;
  displayOrder: number;
}

interface StagedImage {
  key: string;
  url: string; // raw private blob URL (submitted to the server action)
  status: "uploading" | "done" | "error";
  progress: number;
  error?: string;
}

interface ProductImageManagerProps {
  initialImages?: ProductImageValue[];
  onUploadingChange?: (isUploading: boolean) => void;
}

// Multi-image uploader for the product catalog. Uploads go straight from the
// browser to Vercel Blob (client upload, no Server Action body-size limit),
// support reordering (feeds ProductImage.displayOrder) and per-image removal.
// The current ordered list is serialized into a hidden `images` field so the
// surrounding <form action={...}> picks it up like any other form field.
export function ProductImageManager({ initialImages = [], onUploadingChange }: ProductImageManagerProps) {
  const [images, setImages] = useState<StagedImage[]>(() =>
    [...initialImages]
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((img) => ({ key: crypto.randomUUID(), url: img.url, status: "done" as const, progress: 100 }))
  );

  const notifyUploading = (list: StagedImage[]) => {
    onUploadingChange?.(list.some((img) => img.status === "uploading"));
  };

  // Reporting the uploading state to the parent must happen as a side effect,
  // not inside a setState updater (which runs during React's render phase for
  // the child and would otherwise trigger a "setState while rendering a
  // different component" warning).
  useEffect(() => {
    notifyUploading(images);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images]);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newEntries = Array.from(files).map((file) => ({
      key: crypto.randomUUID(),
      file,
      url: "",
      status: "uploading" as const,
      progress: 0,
    }));

    setImages((prev) => {
      const staged: StagedImage[] = newEntries.map(({ key, url, status, progress }) => ({ key, url, status, progress }));
      return [...prev, ...staged];
    });

    for (const entry of newEntries) {
      if (!ACCEPTED_TYPES.includes(entry.file.type)) {
        updateImage(entry.key, { status: "error", error: "Format tidak didukung (JPG, PNG, WEBP)" });
        continue;
      }
      if (entry.file.size > MAX_FILE_SIZE) {
        updateImage(entry.key, { status: "error", error: "Ukuran maksimal 8MB" });
        continue;
      }

      try {
        const blob = await upload(`product-images/${crypto.randomUUID()}-${entry.file.name}`, entry.file, {
          access: "private",
          handleUploadUrl: "/api/blob/product-images",
          onUploadProgress: ({ percentage }) => updateImage(entry.key, { progress: percentage }),
        });
        updateImage(entry.key, { status: "done", progress: 100, url: blob.url });
      } catch {
        updateImage(entry.key, { status: "error", error: "Gagal mengupload gambar" });
      }
    }
  };

  const updateImage = (key: string, patch: Partial<StagedImage>) => {
    setImages((prev) => prev.map((img) => (img.key === key ? { ...img, ...patch } : img)));
  };

  const removeImage = (key: string) => {
    setImages((prev) => {
      const target = prev.find((img) => img.key === key);
      // Best-effort cleanup: delete the blob if it finished uploading, so we
      // don't accumulate orphaned files for images that were never saved.
      if (target?.status === "done" && target.url) {
        fetch(`/api/blob/product-images?url=${encodeURIComponent(target.url)}`, { method: "DELETE" }).catch(() => {});
      }
      return prev.filter((img) => img.key !== key);
    });
  };

  const moveImage = (key: string, direction: "up" | "down") => {
    setImages((prev) => {
      const idx = prev.findIndex((img) => img.key === key);
      const swapWith = direction === "up" ? idx - 1 : idx + 1;
      if (idx < 0 || swapWith < 0 || swapWith >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[swapWith]] = [next[swapWith], next[idx]];
      return next;
    });
  };

  const retryImage = (key: string) => {
    setImages((prev) => prev.filter((img) => img.key !== key));
  };

  const hiddenValue = JSON.stringify(
    images
      .filter((img) => img.status === "done" && img.url)
      .map((img, idx) => ({ url: img.url, displayOrder: idx }))
  );

  return (
    <div className="space-y-3">
      <input type="hidden" name="images" value={hiddenValue} />

      <label className="relative flex flex-col items-center justify-center gap-1.5 p-6 rounded-lg border-2 border-dashed border-slate-200 hover:border-blue-300 hover:bg-red-50/30 transition-colors cursor-pointer text-slate-400">
        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <UploadCloud className="w-6 h-6" />
        <p className="text-xs font-semibold text-center leading-relaxed">
          Upload gambar produk
          <br />
          <span className="font-normal opacity-70">JPG, PNG, WEBP · maks 8MB · bisa beberapa sekaligus</span>
        </p>
      </label>

      {images.length > 0 && (
        <ul className="space-y-2">
          {images.map((img, idx) => (
            <li
              key={img.key}
              className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white p-2 pr-2.5"
            >
              <GripVertical className="w-4 h-4 text-slate-300 shrink-0" />

              <div className="relative w-14 h-14 rounded-md overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                {img.status === "done" && img.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={toPublicImageUrl(img.url) ?? ""} alt="" className="w-full h-full object-cover" />
                ) : img.status === "uploading" ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <Loader2 className="w-4 h-4 text-red-600 animate-spin" />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                {img.status === "uploading" && (
                  <>
                    <p className="text-xs font-semibold text-slate-500">Mengupload... {img.progress}%</p>
                    <div className="mt-1 w-full h-1 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-red-500 transition-all" style={{ width: `${img.progress}%` }} />
                    </div>
                  </>
                )}
                {img.status === "error" && (
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-red-500 truncate">{img.error}</p>
                    <button
                      type="button"
                      onClick={() => retryImage(img.key)}
                      className="text-xs font-bold text-red-600 hover:underline shrink-0"
                    >
                      Hapus
                    </button>
                  </div>
                )}
                {img.status === "done" && (
                  <p className="text-xs font-semibold text-slate-500">
                    {idx === 0 ? "Gambar utama" : `Gambar ${idx + 1}`}
                  </p>
                )}
              </div>

              {img.status === "done" && (
                <div className="flex items-center shrink-0">
                  <button
                    type="button"
                    onClick={() => moveImage(img.key, "up")}
                    disabled={idx === 0}
                    className="p-1 text-slate-400 hover:text-slate-950 disabled:opacity-25 disabled:pointer-events-none"
                    aria-label="Pindah ke atas"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveImage(img.key, "down")}
                    disabled={idx === images.length - 1}
                    className="p-1 text-slate-400 hover:text-slate-950 disabled:opacity-25 disabled:pointer-events-none"
                    aria-label="Pindah ke bawah"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => removeImage(img.key)}
                className="p-1 text-slate-400 hover:text-red-600 shrink-0"
                aria-label="Hapus gambar"
              >
                <X className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
