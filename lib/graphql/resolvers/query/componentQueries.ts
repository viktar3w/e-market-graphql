import { db } from "@/lib/db";
import { DEFAULT_COMPONENT_SIZE } from "@/lib/constants";
import { generateCacheKey } from "@/lib/utils";

const componentSearchCache: Map<string, string> = new Map();

const queries = {
  components: async (
    _parent: unknown,
    args: { limit: number; numberPage: number },
    context: { prisma: typeof db },
  ) => {
    const search = generateCacheKey(args);
    if (componentSearchCache.has(search)) {
      return JSON.parse(componentSearchCache.get(search)!);
    }
    const limit = args?.limit || DEFAULT_COMPONENT_SIZE;
    const numberPage = args?.numberPage || 1;
    const result = await context.prisma.component.findMany({
      skip: (numberPage - 1) * limit,
      take: limit,
      where: {
        products: {
          some: {},
        },
      },
      include: {
        products: true,
      },
    });
    componentSearchCache.set(search, JSON.stringify(result));
    return result;
  },
};

export default queries;
