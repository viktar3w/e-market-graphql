import { Category, Component, Prisma, Product, Variant } from "@prisma/client";
import {ListingArgsType} from "@/lib/types/common";

export type ProductItemType = {
  id: string;
  name: string;
  variants?: ProductVariantItem[];
  image?: string;
  price: number;
};
export type ProductVariantItem = {
  price: number;
  id: string;
};

export type CategoryParent = {
  products: CategoryProductParent[];
} & Category;

export type CategoryProductParent = {
  variants: VariantItem[];
  components: Component[];
} & Product;

export type VariantItem = Variant & {
  data: Prisma.JsonObject;
};

export type GroupVariant = {
  name: string;
  value: string;
  disabled?: boolean;
};

export type NestedItem<T> = {
  key: string;
  values: Record<string, NestedItem<T> | T>;
};

export type ProductArgsType<T> = ListingArgsType<T>;