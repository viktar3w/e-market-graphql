import { MutationAddCartItemProps } from "@/lib/types/cart";
import { getCart } from "@/lib/actions/cartAction";

const mutations = {
  cart: async (
    _: unknown,
    __: unknown,
    context: MutationAddCartItemProps["context"],
  ) => {
    const { prisma: db, userId, cartId } = context;
    return await getCart({
      cartId,
      userId,
      db,
    });
  },
};

export default mutations;
