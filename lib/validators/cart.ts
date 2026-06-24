import { z } from "zod";

export const cartAddSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(99).default(1),
});

export const cartUpdateSchema = z.object({
  cartItemId: z.string().min(1),
  quantity: z.number().int().min(1).max(99),
});

export const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        cartItemId: z.string().min(1),
        productId: z.string().min(1),
        quantity: z.number().int().min(1).max(99),
      }),
    )
    .min(1, "Keranjang tidak boleh kosong"),
  deliveryMethod: z.enum(["PICKUP_COD", "MANUAL_DELIVERY"]),
  paymentMethod: z.enum(["MANUAL_TRANSFER", "COD"]),
  notes: z.string().max(500).optional().or(z.literal("")),
});

export type CartAddInput = z.infer<typeof cartAddSchema>;
export type CartUpdateInput = z.infer<typeof cartUpdateSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
