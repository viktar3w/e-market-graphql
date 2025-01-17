import { Cart, CartStatus } from "@prisma/client";
import { dbType } from "@/lib/db";
import { CartRequest } from "@/lib/validations/cart";
import { ProductItemState } from "@/lib/types/cart";
import { areArraysEqual } from "@/lib/utils";

type GetCartProps = {
  cartId?: string;
  userId?: string;
  db: dbType;
};

type GetCartTokenProps = {
  userId?: string;
  db: dbType;
};

type UpdateCartProps = {
  cart: Cart;
  db: dbType;
};

type AddCartItemProps = {
  cart: Cart;
  cartRequest: CartRequest;
  db: dbType;
};

type DeleteCartItemProps = {
  db: dbType;
  itemId: string;
};

type RemoveShippingAddressProps = {
  db: dbType;
  cart: Cart;
};

export const updateCart = async ({ cart, db }: UpdateCartProps) => {
  const items = await db.cartItem.findMany({
    where: {
      cartId: cart.id,
    },
  });
  const data: { totalAmount: number; qty: number } = items.reduce(
    (result, item) => {
      result.qty += item.qty;
      result.totalAmount += Number((item.qty * item.totalAmount).toFixed(2));
      return result;
    },
    { totalAmount: 0, qty: 0 } as { totalAmount: number; qty: number },
  );
  return db.cart.update({
    where: {
      id: cart.id,
    },
    data: {
      ...data,
    },
  });
};

export const getCart = async ({ cartId, userId, db }: GetCartProps) => {
  if (!cartId) {
    throw new Error("Something is wrong with `cartId` param");
  }
  const cart = await db.cart.findUnique({
    where: { id: cartId, status: CartStatus.ACTIVE },
  });
  if (!cart) {
    throw new Error("We can't find cart");
  }
  if (
    (!userId && !!cart?.userId) ||
    (!!userId && !!cart?.userId && userId !== cart.userId)
  ) {
    throw new Error("Customer was logout");
  }
  return cart;
};

export const getCartToken = async ({
  userId,
  db,
}: GetCartTokenProps): Promise<string> => {
  try {
    let user;
    if (!!userId) {
      user = await db.user.findUnique({
        where: {
          id: userId,
        },
      });
    }
    const cart = await db.cart.create({
      data: {
        userId: user?.id,
      },
    });
    return cart.id;
    // eslint-disable-next-line
  } catch (e: any) {
    console.log("[ERROR] can't create cart: ", e.message);
  }
  return "";
};

export const addCartItem = async ({
  cart,
  db,
  cartRequest,
}: AddCartItemProps) => {
  const productItems = (await db.productItem.findMany({
    where: {
      variantId: cartRequest.variantId,
    },
    include: {
      cartItems: true,
      variant: {
        include: {
          product: true,
        },
      },
      components: true,
    },
  })) as ProductItemState[];

  let productItem: ProductItemState | null;

  if (productItems.length === 0) {
    productItem = (await db.productItem.create({
      data: {
        variantId: cartRequest.variantId,
        components: {
          connect: (cartRequest.componentIds || []).map(
            (componentId: string) => ({
              id: componentId,
            }),
          ),
        },
        data: {},
      },
      include: {
        cartItems: true,
        variant: {
          include: {
            product: true,
          },
        },
        components: true,
      },
    })) as ProductItemState;
  } else {
    productItem =
      productItems.find((item) => {
        if (
          item.components.length !== (cartRequest.componentIds?.length || 0)
        ) {
          return false;
        }
        return areArraysEqual(
          item.components.map((component) => component.id),
          cartRequest.componentIds || [],
        );
      }) || null;
    if (!productItem) {
      productItem = (await db.productItem.create({
        data: {
          variantId: cartRequest.variantId,
          components: {
            connect: (cartRequest.componentIds || []).map(
              (componentId: string) => ({
                id: componentId,
              }),
            ),
          },
          data: {},
        },
        include: {
          cartItems: true,
          variant: {
            include: {
              product: true,
            },
          },
          components: true,
        },
      })) as ProductItemState;
    }
  }
  if (!productItem) {
    throw new Error("We can't create necessary ProductItem");
  }
  const cartItem = productItem.cartItems.find(
    (item) => item.cartId === cart.id,
  );
  if (!cartItem) {
    await db.cartItem.create({
      data: {
        cartId: cart.id,
        name: productItem.variant.product.name,
        productItemId: productItem.id,
        qty: cartRequest.qty,
        totalAmount: Number(cartRequest.amount.toFixed(2)),
      },
    });
  } else {
    await db.cartItem.update({
      where: {
        id: cartItem.id,
      },
      data: {
        qty: cartItem.qty + cartRequest.qty,
      },
    });
  }
  await updateCart({
    cart,
    db,
  });

  return true;
};

export const deleteCartItem = async ({ db, itemId }: DeleteCartItemProps) => {
  const cartItem = await db.cartItem.findUnique({
    where: {
      id: itemId,
    },
  });
  if (!cartItem) {
    throw new Error("We can't find Cart Item");
  }
  await db.cartItem.delete({
    where: { id: itemId },
  });
  const productItem = await db.productItem.findUnique({
    where: {
      id: cartItem.productItemId,
    },
    include: {
      cartItems: true,
    },
  });
  if (!!productItem && productItem.cartItems.length === 0) {
    await db.productItem.delete({
      where: {
        id: cartItem.productItemId,
      },
    });
  }
  return true;
};

export const removeShippingAddress = async ({
  db,
  cart,
}: RemoveShippingAddressProps) => {
  if (!cart?.shippingAddressId) {
    throw new Error("Cart or shipping address not found");
  }
  const address = await db.shippingAddress.findUnique({
    where: { id: cart.shippingAddressId },
    include: { carts: true, orders: true },
  });

  if (!address) {
    throw new Error("Shipping address not found");
  }
  const totalLinks =
    (address?.carts?.length || 0) + (address?.orders?.length || 0);
  await db.cart.update({
    where: { id: cart.id },
    data: { shippingAddressId: null },
  });
  if (totalLinks === 1) {
    await db.shippingAddress.delete({
      where: { id: address.id },
    });
  }
  return true;
};
