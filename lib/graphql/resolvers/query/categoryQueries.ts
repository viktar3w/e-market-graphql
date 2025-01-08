import { db } from "@/lib/db";
import {
  generateCacheKey,
  preparedCategoryProductVariantsByPrice,
  prepareCategoryPrismaOption,
} from "@/lib/utils";
import { CategoryParent } from "@/lib/types/product";
import {
  DEFAULT_PRODUCT_NUMBER_PAGE,
  DEFAULT_PRODUCT_SIZE,
} from "@/lib/constants";
import { CategoryArgsType } from "@/lib/types/category";

const categorySearchCache: Map<string, string> = new Map();

const queries = {
  categories: async (
    _parent: unknown,
    args: CategoryArgsType<never>,
    context: { prisma: typeof db },
  ) => {
    const search = generateCacheKey(args);
    if (categorySearchCache.has(search)) {
      return JSON.parse(categorySearchCache.get(search)!);
    }
    const options = prepareCategoryPrismaOption<never>(args);
    const count = await context.prisma.category.count({
      where: options.where ?? {},
    });
    let categories = (await context.prisma.category.findMany(
      options,
    )) as CategoryParent[];
    const minPrice = !!args?.filter?.minPrice
      ? Number(args?.filter?.minPrice)
      : undefined;
    const maxPrice = !!args?.filter?.maxPrice
      ? Number(args?.filter?.maxPrice)
      : undefined;
    if (!!minPrice || !!maxPrice) {
      categories = preparedCategoryProductVariantsByPrice(
        categories,
        minPrice,
        maxPrice,
      );
    }
    const size = Number(args?.limit || DEFAULT_PRODUCT_SIZE);
    const result = {
      items: categories,
      total_count: count,
      page_info: {
        current_page: Number(
          args?.filter?.number_page || DEFAULT_PRODUCT_NUMBER_PAGE,
        ),
        page_size: Number(args?.limit || DEFAULT_PRODUCT_SIZE),
        total_pages: Math.ceil(count / size),
      },
    };
    categorySearchCache.set(search, JSON.stringify(result));
    return result;
  },
};

export default queries;
