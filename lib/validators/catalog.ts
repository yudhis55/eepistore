import { z } from "zod";

export const storeApplySchema = z.object({
  storeName: z
    .string()
    .min(3, "Nama toko minimal 3 karakter")
    .max(100, "Nama toko maksimal 100 karakter"),
  description: z.string().max(500, "Deskripsi maksimal 500 karakter").optional().or(z.literal("")),
  pickupLocation: z
    .string()
    .max(255, "Lokasi pengambilan maksimal 255 karakter")
    .optional()
    .or(z.literal("")),
  logoUrl: z.string().url().optional().or(z.literal("")),
});

export const categorySchema = z.object({
  name: z
    .string()
    .min(2, "Nama kategori minimal 2 karakter")
    .max(100, "Nama kategori maksimal 100 karakter"),
  parentId: z.string().optional().or(z.literal("")),
  icon: z.string().max(50).optional().or(z.literal("")),
});

export const productSchema = z.object({
  name: z
    .string()
    .min(3, "Nama produk minimal 3 karakter")
    .max(200, "Nama produk maksimal 200 karakter"),
  description: z
    .string()
    .max(5000, "Deskripsi maksimal 5000 karakter")
    .optional()
    .or(z.literal("")),
  price: z.number().min(0, "Harga tidak boleh negatif").max(999999999, "Harga terlalu besar"),
  stock: z.number().int("Stok harus bilangan bulat").min(0, "Stok tidak boleh negatif"),
  condition: z.enum(["NEW", "PRELOVED"]),
  status: z.enum(["DRAFT", "ACTIVE", "INACTIVE"]),
  categoryId: z.string().optional().or(z.literal("")),
  images: z
    .array(z.string().url())
    .min(1, "Minimal 1 foto produk")
    .max(8, "Maksimal 8 foto produk"),
  variants: z
    .array(
      z.object({
        name: z.string().min(1).max(100),
        value: z.string().min(1).max(100),
        priceAdjustment: z.number().min(-999999999).max(999999999).default(0),
        stock: z.number().int().min(0).default(0),
      }),
    )
    .optional()
    .default([]),
});

export const productUpdateSchema = productSchema.partial();

export type StoreApplyInput = z.infer<typeof storeApplySchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
