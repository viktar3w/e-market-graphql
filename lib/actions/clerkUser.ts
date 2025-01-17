import { db } from "@/db";
import { UserJSON } from "@clerk/backend";
import { CartStatus, Prisma, UserType } from "@prisma/client";
import { cookies } from "next/headers";
import { CART_COOKIE_KEY } from "@/lib/constants";
import { areArraysEqual } from "@/lib/utils";
import { CartItemState, CartState } from "@/lib/types/cart";
import { cartAction } from "@/actions/cartAction";
import { UserState } from "@/lib/types/user";

export const userCreateWebhook = async (userData: UserJSON) => {
  return db.user.create({
    data: {
      id: userData.id,
      firstname: userData.first_name || "User",
      lastname: userData.last_name || "e-Market",
      email: userData.email_addresses[0]?.email_address,
      verified: !!userData.email_addresses[0]?.verification?.id
        ? new Date().toLocaleString()
        : null,
      phone: userData?.phone_numbers[0]?.phone_number,
      image: (userData.has_image && userData.image_url) || undefined,
    },
  });
};

export const userDeleteWebhook = async (userId: string) => {
  const user = await db.user.findUnique({
    where: {
      id: userId,
    },
  });
  if (!!user) {
    await db.user.update({
      where: {
        id: userId,
      },
      data: {
        status: UserType.DISABLED,
      },
    });
    await db.cart.updateMany({
      where: {
        userId: userId,
      },
      data: {
        status: CartStatus.NOT_ACTIVE,
      },
    });
  }
};

export const sessionCreateWebhook = async (
  userId: string,
  cart?: CartState,
) => {
  const user = (await fetchUserWithActiveCarts(userId)) as UserState;
  if (!user || !cart || cart?.userId === user?.id) {
    return;
  }
  const cartItems = cart.cartItems || [];
  if (cartItems.length > 0) {
    const { disableCartIds, addingCartItems } = await processCartItems(
      user,
      cartItems,
    );
    await handleCartUpdate(cart, user, addingCartItems);
    await deactivateOldCarts(disableCartIds);
    await cartAction(cart);
  } else {
    await handleCartWithoutItems(user, cart);
  }
};

const fetchUserWithActiveCarts = async (userId: string) => {
  return db.user.findUnique({
    where: { id: userId },
    include: {
      carts: {
        where: { status: CartStatus.ACTIVE },
        include: {
          cartItems: {
            include: {
              productItem: {
                include: { variant: true, components: true },
              },
            },
          },
        },
      },
    },
  });
};

export const processCartItems = async (
  user: UserState,
  cartItems: CartItemState[],
) => {
  const disableCartIds: string[] = [];
  const addingCartItems: { id: string }[] = [];

  for (const userCart of user.carts || []) {
    for (const userCartItem of userCart.cartItems || []) {
      const oldCartItem = cartItems.find((cartItem) =>
        compareCartItems(cartItem, userCartItem),
      );
      if (!oldCartItem) {
        addingCartItems.push({ id: userCartItem.id });
      }
    }
    disableCartIds.push(userCart.id);
  }

  return { disableCartIds, addingCartItems };
};

export const compareCartItems = (
  cartItemOne: CartItemState,
  cartItemTwo: CartItemState,
) => {
  const oneComponents = cartItemOne.productItem?.components ?? [];
  const twoComponents = cartItemTwo.productItem?.components ?? [];

  return (
    cartItemTwo.productItem.variantId === cartItemOne.productItem.variantId &&
    areArraysEqual(
      oneComponents.map((c: any) => c.id),
      twoComponents.map((c: any) => c.id),
    )
  );
};

export const handleCartUpdate = async (
  cart: CartState,
  user: UserState,
  addingCartItems: { id: string }[],
) => {
  let data: Prisma.CartUncheckedUpdateInput = { userId: user.id };
  if (addingCartItems.length > 0) {
    data = {
      userId: user.id,
      cartItems: {
        connect: [
          ...addingCartItems,
          ...cart.cartItems.map((item: any) => ({ id: item.id })),
        ],
      },
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      phone: user.phone,
    };
  }
  return db.cart.update({
    where: { id: cart.id },
    data,
  });
};

export const deactivateOldCarts = async (disableCartIds: string[]) => {
  if (disableCartIds.length > 0) {
    await db.cart.updateMany({
      where: { id: { in: disableCartIds } },
      data: { status: CartStatus.NOT_ACTIVE },
    });
  }
};

export const handleCartWithoutItems = async (
  user: UserState,
  cart: CartState,
) => {
  let data: Prisma.CartUncheckedUpdateInput = { userId: user.id };
  if (user.carts.length > 0) {
    cookies().delete(CART_COOKIE_KEY);
    cookies().set(CART_COOKIE_KEY, user.carts.find((cart) => !!cart.id)!.id, {
      path: "/",
      httpOnly: true,
    });
    data = { status: CartStatus.NOT_ACTIVE };
  }
  return db.cart.update({
    where: { id: cart.id },
    data,
  });
};

export const deleteCartIdWebhook = () => {
  cookies().delete(CART_COOKIE_KEY);
};
