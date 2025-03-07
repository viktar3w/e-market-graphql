import Stripe from "stripe";

import { PaymentType } from "@/lib/enums/payment";

const stripeClientSingleton = () => {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-12-18.acacia",
    typescript: true,
  });
};

declare global {
  // eslint-disable-next-line no-var
  var stripeGlobal: undefined | stripeType;
}

export const stripe = globalThis.stripeGlobal ?? stripeClientSingleton();
export type stripeType = ReturnType<typeof stripeClientSingleton>;

if (process.env.NODE_ENV !== "production") globalThis.stripeGlobal = stripe;

export const createSupportSession = async ({
  userEmail,
  supportId,
}: {
  userEmail: string;
  supportId: string;
}) => {
  return await stripe.checkout.sessions.create({
    line_items: [
      {
        price: process.env.STRIPE_SUPPORT_PRICE_PRO_PLAN,
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${process.env.NEXT_PUBLIC_STRIPE_REDIRECT}/support/dashboard?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_STRIPE_REDIRECT}/support/pricing`,
    customer_email: userEmail,
    metadata: {
      type: PaymentType.SUPPORT,
      supportId: supportId,
    },
  });
};

type CreateProductSessionProps = {
  token: string;
  lineItems: Stripe.Checkout.SessionCreateParams.LineItem[];
  stripe: typeof stripe;
};

export const createProductSession = async ({
  token,
  lineItems,
  stripe,
}: CreateProductSessionProps) => {
  return await stripe.checkout.sessions.create({
    success_url: `${process.env.NEXT_PUBLIC_STRIPE_REDIRECT}/checkout/success?token=${token}`,
    cancel_url: `${process.env.NEXT_PUBLIC_STRIPE_REDIRECT}/checkout/error?token=${token}`,
    payment_method_types: ["card"],
    mode: "payment",
    billing_address_collection: "required",
    metadata: {
      type: PaymentType.SHOP_PRODUCT,
      token: token,
    },
    line_items: lineItems,
  });
};
