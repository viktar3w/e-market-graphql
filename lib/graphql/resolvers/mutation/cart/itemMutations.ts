import {
  CartIdRequestSchema,
  CartRequestSchema,
  CartUpdateRequestSchema,
} from "@/lib/validations/cart";
import {
  MutationAddCartItemProps,
  MutationDeleteCartItemProps,
  MutationUpdateCartItemProps,
} from "@/lib/types/cart";
import {
  addCartItem as addItemAction,
  deleteCartItem,
  updateCart,
} from "@/lib/actions/cartAction";

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
};

export default mutations;
