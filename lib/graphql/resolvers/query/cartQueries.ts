import { CartStatus } from "@prisma/client";
import { ContextGraphql } from "@/lib/types/types";

const queries = {
  cart: async (_: unknown, __: unknown, context: ContextGraphql) => {
    const { prisma: db, cartId, userId } = context;
    if (!cartId) {
      throw new Error("Check your graphql endpoint");
    }
    const cart = await db.cart.findUnique({
      where: {
        id: cartId,
        status: CartStatus.ACTIVE,
      },
      include: {
        cartItems: {
          orderBy: {
            createdAt: "desc",
          },
          include: {
            productItem: {
              include: {
                variant: {
                  include: {
                    product: true,
                  },
                },
                components: true,
              },
            },
          },
        },
        shippingAddress: true,
        billingAddress: true,
        user: true
      },
    });
    if (!cart || (!userId && !!cart?.userId) || userId !== cart.userId) {
      throw new Error("We can't find cart");
    }
    return cart;
  },
};

export default queries;
