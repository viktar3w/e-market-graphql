import { Order, ShippingAddress } from "@prisma/client";

import { CartState } from "@/lib/types/cart";

export type PlaceOrderType = {
  url: string;
};
export type OrderState = {
  cart: CartState;
  shippingAddress: ShippingAddress;
} & Order;
