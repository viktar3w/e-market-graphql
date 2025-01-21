import { CartStatus, OrderStatus, PaymentType, Prisma } from "@prisma/client";
import Stripe from "stripe";
import crypto from "crypto";
import {
  CartIdRequestSchema,
  CartRequestSchema,
  CartUpdateRequestSchema,
} from "@/lib/validations/cart";
import {
  MutationAddCartItemProps,
  MutationDeleteCartItemProps,
  MutationUpdateCartItemProps,
  CartState,
  MutationPlaceOrderProps,
} from "@/lib/types/cart";
import {
  addCartItem as addItemAction,
  deleteCartItem,
  updateCart,
} from "@/lib/actions/cartAction";
import OrderEmail from "@/components/shared/emails/OrderEmail";
import { CheckoutPlaceOrderValidation } from "@/lib/validations/checkout";
import { OrderState } from "@/lib/types/checkout";

import OrderCreateInput = Prisma.OrderCreateInput;
import { createProductSession } from "@/lib/stripe/stripe";
import { sendEmail } from "@/lib/email";

const mutations = {
  addItem: async (
    cart: MutationAddCartItemProps["parent"],
    args: MutationAddCartItemProps["args"],
    context: MutationAddCartItemProps["context"],
  ) => {
    const { prisma: db } = context;
    const cartRequest = CartRequestSchema.parse(args.input);
    await addItemAction({
      db,
      cart,
      cartRequest,
    });
    return {
      success: true,
    };
  },
  updateItem: async (
    cart: MutationUpdateCartItemProps["parent"],
    args: MutationUpdateCartItemProps["args"],
    context: MutationUpdateCartItemProps["context"],
  ) => {
    const { prisma: db } = context;
    const cartItemDetails = CartUpdateRequestSchema.parse({
      id: args.input.itemId,
      qty: args.input.qty,
    });
    const cartItem = await db.cartItem.findUnique({
      where: {
        id: cartItemDetails.id,
      },
    });
    if (!cartItem) {
      throw new Error("We can't find Cart Item");
    }
    await db.cartItem.update({
      where: { id: cartItemDetails.id },
      data: { qty: cartItemDetails.qty > 0 ? cartItemDetails.qty : 1 },
    });
    await updateCart({
      cart,
      db,
    });
    return {
      success: true,
    };
  },
  deleteItem: async (
    cart: MutationDeleteCartItemProps["parent"],
    args: MutationDeleteCartItemProps["args"],
    context: MutationDeleteCartItemProps["context"],
  ) => {
    const { prisma: db } = context;

    const cartItemDetails = CartIdRequestSchema.parse({
      id: args.input.itemId,
    });

    await deleteCartItem({ db, itemId: cartItemDetails.id });

    await updateCart({
      cart,
      db,
    });

    return {
      success: true,
    };
  },
  placeOrder: async (
    cart: MutationPlaceOrderProps["parent"],
    args: MutationPlaceOrderProps["args"],
    context: MutationPlaceOrderProps["context"],
  ) => {
    const { prisma: db, stripe } = context;

    const totalInfo = CheckoutPlaceOrderValidation.parse(args.input);
    const cartInfo = await db.cart.findUnique({
      where: {
        id: cart.id,
      },
      include: {
        cartItems: {
          include: {
            productItem: {
              include: {
                variant: {
                  include: {
                    product: true,
                  },
                },
              },
            },
          },
        },
        shippingAddress: true,
      },
    });
    if (!cartInfo || !cartInfo.shippingAddress?.id) {
      throw new Error("something was wrong with getting cart data");
    }
    const token = crypto.randomBytes(15).toString("hex");
    const data: OrderCreateInput = {
      token: token,
      taxAmount: totalInfo.taxAmount,
      shippingAmount: totalInfo.shippingAmount,
      totalAmount: cartInfo.totalAmount,
      summaryAmount: totalInfo.summaryAmount,
      qty: cartInfo.qty,
      status: OrderStatus.PENDING,
      paymentType: PaymentType.STRIPE,
      paymentId: "",
      items: {},
      currency: "USD",
      cart: {
        connect: {
          id: cartInfo.id,
        },
      },
      shippingAddress: {
        connect: {
          id: cartInfo.shippingAddress.id,
        },
      },
    };
    if (cartInfo.userId) {
      data.user = {
        connect: {
          id: cartInfo.userId,
        },
      };
    }
    const order = await db.order.create({
      data,
    });
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    for (const cartItem of cartInfo.cartItems) {
      const images: string[] = [];
      console.log(cartItem.productItem.variant.image);
      if (!!cartItem?.productItem?.variant?.image) {
        images.push(cartItem.productItem.variant.image);
      }
      const product = await stripe.products.create({
        name: cartItem.name,
        url: `${process.env.NEXT_PUBLIC_SERVER_URL}/${cartItem.productItem.variant.product.id}`,
        default_price_data: {
          currency: order.currency,
          unit_amount_decimal: Number(cartItem.totalAmount * 100).toFixed(2),
        },
        images: images,
      });
      lineItems.push({
        price: product.default_price as string,
        quantity: cartItem.qty,
      });
    }
    if (!!order.taxAmount) {
      const tax = await stripe.products.create({
        name: "Common Taxes Amount",
        default_price_data: {
          currency: order.currency,
          unit_amount_decimal: Number(order.taxAmount * 100).toFixed(),
        },
      });
      lineItems.push({
        price: tax.default_price as string,
        quantity: 1,
      });
    }
    if (!!order.shippingAmount) {
      const tax = await stripe.products.create({
        name: "Common Shipping Amount",
        default_price_data: {
          currency: order.currency,
          unit_amount_decimal: Number(
            Number(order.shippingAmount.toFixed(2)) * 100,
          ).toFixed(2),
        },
      });
      lineItems.push({
        price: tax.default_price as string,
        quantity: 1,
      });
    }
    const stripeSession = await createProductSession({
      stripe,
      lineItems,
      token,
    });
    await db.cart.update({
      where: {
        id: cartInfo.id,
      },
      data: {
        status: CartStatus.NOT_ACTIVE,
      },
    });
    try {
      await sendEmail({
        to: cartInfo.shippingAddress.email,
        subject: "e-Market: Your order was created",
        from: "v.starovoitou@trial-3z0vklo17n7g7qrx.mlsender.net",
        template: OrderEmail({
          order: order as OrderState,
          cart: cartInfo as CartState,
        }),
      });
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log("[ERROR] can't send order create email: ", e.message);
      } else {
        console.error('[ERROR] PlaceOrder Unknown error');
      }
    }

    return {
      url: stripeSession.url,
    };
  },
};

export default mutations;
