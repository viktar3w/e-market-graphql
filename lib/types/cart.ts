import {
  Cart,
  CartItem,
  Component,
  Product,
  ProductItem,
  ShippingAddress,
} from "@prisma/client";

import { VariantItem } from "@/lib/types/product";
import { ContextGraphql } from "@/lib/types/types";
import { CheckoutDeliverySchema } from "@/lib/validations/checkout";

export type MutationAddCartItemProps = {
  args: {
    input: {
      amount: number;
      variantId: string;
      qty: number;
      componentIds?: string[];
    };
  };
} & MutationCommonProps;

export type MutationUpdateCartItemProps = {
  args: {
    input: {
      itemId: string;
      qty: number;
    };
  };
} & MutationCommonProps;

export type MutationDeleteCartItemProps = {
  args: {
    input: {
      itemId: string;
    };
  };
} & MutationCommonProps;

export type MutationShippingAddressProps = {
  args: {
    input: CheckoutDeliverySchema;
  };
} & MutationCommonProps;

export type MutationCommonProps = {
  parent: Cart;
  context: ContextGraphql;
};

export type CartState = Cart & {
  cartItems: CartItemState[];
  shippingAddress?: ShippingAddress | null;
};

export type CartItemState = {
  productItem: ProductItemState;
} & CartItem;
export type ProductItemState = {
  cartItems: CartItemState[];
  variant: VariantItemState;
  components: Component[];
} & ProductItem;

export type VariantItemState = {
  product: ProductState;
} & VariantItem;

export type ProductState = Product;
