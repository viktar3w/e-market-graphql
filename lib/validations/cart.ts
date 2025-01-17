import * as z from "zod";
export const CartRequestSchema = z.object({
  amount: z.number().min(1, { message: "Amount is require field" }),
  variantId: z
    .string()
    .min(25, { message: "VariantId is require field" })
    .max(50),
  componentIds: z.array(z.string().max(50)).optional(),
  qty: z.number().min(1, { message: "Qty is require field" }),
});
export const CartIdRequestSchema = z.object({
  id: z
    .string()
    .min(25, { message: "Id is require field" })
    .max(50),
});
export const CartUpdateRequestSchema = z.object({
  id: z
    .string()
    .min(25, { message: "Id is require field" })
    .max(50),
  qty: z.number().min(1, { message: "Qty is require field" }),
});
export type CartRequest = z.infer<typeof CartRequestSchema>;
export type CartIdRequest = z.infer<typeof CartIdRequestSchema>;
export type CartUpdateRequest = z.infer<typeof CartUpdateRequestSchema>;
