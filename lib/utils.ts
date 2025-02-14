import { Component, Prisma } from "@prisma/client";

import {
  DEFAULT_EMPTY_PRODUCT_IMAGE,
  DEFAULT_PRODUCT_NUMBER_PAGE,
  DEFAULT_PRODUCT_SIZE,
} from "@/lib/constants";
import {
  CategoryParent,
  CategoryProductParent,
  ProductArgsType,
  VariantItem,
} from "@/lib/types/product";
import { CategoryArgsType } from "@/lib/types/category";
import ProductWhereInput = Prisma.ProductWhereInput;
import CategoryWhereInput = Prisma.CategoryWhereInput;
import VariantWhereInput = Prisma.VariantWhereInput;

export const formatPrice = (price: number): string => {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });
  return formatter.format(price);
};

export const getMinimumPrice = (variants: VariantItem[]) => {
  return variants?.sort((a, b) => a.price - b.price)?.[0]?.price || 0;
};

export const getProductDetails = (
  variant: VariantItem | null,
  componentIds: Set<string>,
  components: Component[],
): string => {
  let description: string = "";
  if (!!variant?.data) {
    description = Object.keys(variant.data)
      .reduce((text, key) => {
        text.push(`${key}: ${variant.data[key]}`);
        return text;
      }, [] as string[])
      .join(",\n");
  }
  if (componentIds.size > 0) {
    description += description === "" ? "" : ". ";
    description +=
      "Components: \n" +
      Array.from(componentIds)
        .reduce((text, id) => {
          const component = components.find((c) => c.id === id);
          if (!component) {
            return text;
          }
          text.push(component.name);
          return text;
        }, [] as string[])
        .join(", ");
  }
  return description;
};

export const preparedCategoryProductVariantsByPrice = (
  categories: CategoryParent[],
  minPrice?: number,
  maxPrice?: number,
) => {
  for (let i = 0; i < categories.length; i++) {
    for (let j = 0; j < categories[i].products.length; j++) {
      const filteredVariants = categories[i].products[j].variants.filter(
        (variant) => {
          return (
            (!minPrice || variant.price >= Number(minPrice)) &&
            (!maxPrice || variant.price <= Number(maxPrice))
          );
        },
      );
      const minVariant =
        filteredVariants.length > 0
          ? filteredVariants.reduce((minVar, currentVar) =>
              currentVar.price < minVar.price ? currentVar : minVar,
            )
          : null;
      categories[i].products[j].variants = minVariant ? [minVariant] : [];
    }
  }
  return categories;
};

export const preparedProductVariantsByPrice = (
  products: CategoryProductParent[],
  minPrice?: number,
  maxPrice?: number,
) => {
  for (let j = 0; j < products.length; j++) {
    const filteredVariants = products[j].variants.filter((variant) => {
      return (
        (!minPrice || variant.price >= Number(minPrice)) &&
        (!maxPrice || variant.price <= Number(maxPrice))
      );
    });
    const minVariant =
      filteredVariants.length > 0
        ? filteredVariants.reduce((minVar, currentVar) =>
            currentVar.price < minVar.price ? currentVar : minVar,
          )
        : null;
    products[j].variants = minVariant ? [minVariant] : [];
  }
  return products;
};

export const prepareCategoryPrismaOption = <T>(args: CategoryArgsType<T>) => {
  const limit = Number(args?.limit || DEFAULT_PRODUCT_SIZE);
  const numberPage = Number(args?.number_page || DEFAULT_PRODUCT_NUMBER_PAGE);
  const options = {
    skip: (numberPage - 1) * limit, // Пропустить записи для предыдущих страниц
    take: limit,
    include: {
      products: {
        include: {
          components: true,
          variants: {
            where: {} as VariantWhereInput,
            orderBy: {
              price: Prisma.SortOrder.asc,
            },
          },
        },
        where: {} as ProductWhereInput,
      },
    },
    where: {} as CategoryWhereInput,
  };
  if (Object.keys(args).length > 0) {
    if (!!args?.filter?.query) {
      options.where = {
        name: {
          contains: String(args?.filter?.query),
          mode: "insensitive",
        },
      };
    }
  }
  return options;
};

export const prepareProductPrismaOption = <T>(args: ProductArgsType<T>) => {
  const limit = Number(args?.limit || DEFAULT_PRODUCT_SIZE);
  const numberPage = Number(args?.number_page || DEFAULT_PRODUCT_NUMBER_PAGE);
  const options = {
    skip: (numberPage - 1) * limit, // Пропустить записи для предыдущих страниц
    take: limit,
    include: {
      components: true,
      variants: {
        where: {} as VariantWhereInput,
        orderBy: {
          price: Prisma.SortOrder.asc,
        },
      },
    },
    where: {} as ProductWhereInput,
    orderBy: {} as
      | Prisma.ProductOrderByWithRelationInput
      | Prisma.ProductOrderByWithRelationInput[],
  };
  if (Object.keys(args?.filter || {}).length > 0) {
    if (!!args.filter?.ids) {
      options.where.id = {
        in: args.filter?.ids as string[],
      };
    }
    if (!!args?.filter?.query) {
      options.where.name = {
        contains: String(args?.filter?.query),
        mode: "insensitive",
      };
    }
    if (!!args?.filter?.available) {
      options.where.available =
        String(args?.filter?.available).toLowerCase() === "true";
    }
    if (!!args?.filter?.new) {
      options.where.new = String(args?.filter?.new).toLowerCase() === "true";
    }
    if (!!args?.filter?.components) {
      if (!!args?.filter?.components) {
        options.where.components = {
          some: {
            id: { in: args?.filter?.components as string[] },
          },
        };
      }
    }
    const minPrice = !!args?.filter?.minPrice
      ? Number(args?.filter?.minPrice)
      : undefined;
    const maxPrice = !!args?.filter?.maxPrice
      ? Number(args?.filter?.maxPrice)
      : undefined;
    if (!!minPrice || !!maxPrice) {
      options.where.variants = {
        some: {
          AND: [
            minPrice ? { price: { gte: minPrice } } : undefined,
            maxPrice ? { price: { lte: maxPrice } } : undefined,
          ].filter(Boolean) as VariantWhereInput[],
        },
      };
    }
  }
  if (!!args?.sort && Object.keys(args.sort).length > 0) {
    if (!!args.sort?.new) {
      options.orderBy = {
        new: args.sort.new as Prisma.SortOrder,
      };
    }
  }
  return options;
};

export const areArraysEqual = (arr1: string[], arr2: string[]): boolean => {
  if (arr1.length !== arr2.length) return false;
  return arr1.sort().join(",") === arr2.sort().join(",");
};

export const getImage = (image?: string | null): string => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  return showImage(image) ? image : DEFAULT_EMPTY_PRODUCT_IMAGE;
};

export const showImage = (image?: string | null) => {
  return !!image && image.includes("http");
};

export const parseColor = (color: string) => {
  const hex = color.startsWith("#") ? color.slice(1) : color;
  return parseInt(hex, 16);
};

export const sanitize = (html: string) => {
  return html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
};

export const generateCacheKey = (
  obj: Record<string, unknown> | Record<string, Record<string, unknown>>,
): string => {
  const processValue = (value: unknown): string => {
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      const sortedObjectKeys = Object.keys(value).sort();
      return `{${sortedObjectKeys.map((key) => `${key}:${processValue((value as Record<string, unknown>)[key])}`).join(",")}}`;
    }
    if (Array.isArray(value)) {
      return `[${value!.map(processValue).sort().join(",")}]`;
    }
    return String(value);
  };

  const sortedKeys = Object.keys(obj).sort();
  return `${sortedKeys.map((key) => `${key}:${processValue(obj[key])}`).join("_")}`;
};
