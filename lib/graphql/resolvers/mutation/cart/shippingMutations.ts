import { MutationShippingAddressProps } from "@/lib/types/cart";
import { prepareAddress } from "@/lib/actions/addressAction";
import { removeShippingAddress } from "@/lib/actions/cartAction";

const mutations = {
  addShippingAddress: async (
    cart: MutationShippingAddressProps["parent"],
    args: MutationShippingAddressProps["args"],
    context: MutationShippingAddressProps["context"],
  ) => {
    const { prisma } = context;
    const preparedData = prepareAddress(args.input);
    const shippingAddress = await prisma.shippingAddress.create({
      data: {
        ...preparedData,
      },
    });
    if (!!cart.shippingAddressId) {
      throw new Error("Cart already has shipping address");
    }
    await prisma.cart.update({
      where: {
        id: cart.id,
      },
      data: {
        shippingAddress: {
          connect: {
            id: shippingAddress.id,
          },
        },
      },
    });
    return { success: true };
  },
  updateShippingAddress: async (
    cart: MutationShippingAddressProps["parent"],
    args: MutationShippingAddressProps["args"],
    context: MutationShippingAddressProps["context"],
  ) => {
    if (!cart.shippingAddressId) {
      throw new Error("Cart hasn't shipping address");
    }
    const { prisma } = context;
    const preparedData = prepareAddress(args.input);
    await prisma.shippingAddress.update({
      where: {
        id: cart.shippingAddressId,
      },
      data: {
        ...preparedData,
      },
    });
    return { success: true };
  },
  deleteShippingAddress: async (
    cart: MutationShippingAddressProps["parent"],
    _: unknown,
    context: MutationShippingAddressProps["context"],
  ) => {
    if (!cart.shippingAddressId) {
      throw new Error("Cart hasn't shipping address");
    }
    const { prisma } = context;
    await removeShippingAddress({
      cart,
      db: prisma,
    });
    return {
      success: true,
    };
  },
};

export default mutations;
