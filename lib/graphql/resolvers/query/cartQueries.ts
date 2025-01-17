import { db } from "@/lib/db";
import { CartStatus } from "@prisma/client";

const queries = {
  cart: async (
    _parent: unknown,
    args: { cartId: string },
    context: { prisma: typeof db; userId: string | null },
  ) => {
    const cart = await db.cart.findUnique({
      where: {
        id: args.cartId,
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
      },
    });
    if (
      !cart ||
      (!context?.userId && !!cart?.userId) ||
      context.userId !== cart.userId
    ) {
      throw new Error("We can't find cart");
    }
    return cart;
  },
};

export default queries;
