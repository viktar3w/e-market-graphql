import * as z from "zod";
export const CheckoutPersonalDataValidation = z.object({
  firstname: z.string().min(3).max(50),
  lastname: z.string().min(3).max(50),
  email: z.string().email(),
  phone: z
    .string()
    .min(1)
    .regex(
      /^\+?[1-9]\d{1,14}$/,
      "Your phone isn't valid. Example: +15555555555",
    ),
});

export const CheckoutDeliveryValidation = z.object({
  firstname: z.string().min(3).max(50),
  lastname: z.string().min(3).max(50),
  email: z.string().email(),
  phone: z
    .string()
    .min(1)
    .regex(
      /^\+?[1-9]\d{1,14}$/,
      "Your phone isn't valid. Example: +15555555555",
    ),
  country: z.string().min(2).max(50),
  city: z.string().min(3).max(50),
  state: z.string().max(50),
  street: z.string().min(5).max(200),
  postcode: z.string().min(3).max(15),
});

export const CheckoutPlaceOrderValidation = z.object({
  taxAmount: z.number().min(0).max(9000),
  shippingAmount: z.number().min(0).max(9000),
  summaryAmount: z.number().min(0).max(9999999999),
});

export type CheckoutPersonalDataSchema = z.infer<
  typeof CheckoutPersonalDataValidation
>;
export type CheckoutDeliverySchema = z.infer<typeof CheckoutDeliveryValidation>;
export type CheckoutPlaceOrderSchema = z.infer<
  typeof CheckoutPlaceOrderValidation
>;
