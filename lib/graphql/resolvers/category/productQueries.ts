import { db } from "@/lib/db";
import { CategoryProductParent, ProductArgsType } from "@/lib/types/product";
import {
  generateCacheKey,
  preparedProductVariantsByPrice,
  prepareProductPrismaOption,
} from "@/lib/utils";
import {
  DEFAULT_PRODUCT_NUMBER_PAGE,
  DEFAULT_PRODUCT_SIZE,
} from "@/lib/constants";

const productSearchCache: Map<string, string> = new Map();

const queries = {
  products: async (
    parent: {
      id?: string;
    },
    args: ProductArgsType<never>,
    context: { prisma: typeof db },
  ) => {
    const search = generateCacheKey({ ...args, categoryId: parent?.id });
    if (productSearchCache.has(search)) {
      return JSON.parse(productSearchCache.get(search)!);
    }
    const options = prepareProductPrismaOption<never>(args);
    if (!!parent?.id) {
      options.where.categories = {
        some: {
          id: parent.id,
        },
      };
    }
    const count = await context.prisma.product.count({
      where: options.where ?? {},
    });
    let products = (await context.prisma.product.findMany(
      options,
    )) as CategoryProductParent[];
    const minPrice = !!args?.filter?.minPrice
      ? Number(args?.filter?.minPrice)
      : undefined;
    const maxPrice = !!args?.filter?.maxPrice
      ? Number(args?.filter?.maxPrice)
      : undefined;

    if (!!minPrice || !!maxPrice) {
      products = preparedProductVariantsByPrice(products, minPrice, maxPrice);
    }
    const size = Number(args?.limit || DEFAULT_PRODUCT_SIZE);
    const result = {
      items: products,
      total_count: count,
      page_info: {
        current_page: Number(
          args?.filter?.number_page || DEFAULT_PRODUCT_NUMBER_PAGE,
        ),
        page_size: Number(args?.limit || DEFAULT_PRODUCT_SIZE),
        total_pages: Math.ceil(count / size),
      },
    };
    productSearchCache.set(search, JSON.stringify(result));
    return result;
  },
};

export default queries;
