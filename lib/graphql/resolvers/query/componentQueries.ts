import { db } from "@/lib/db";
import { DEFAULT_COMPONENT_SIZE } from "@/lib/constants";

const queries = {
  components: async (
    _parent: unknown,
    args: { limit: number; numberPage: number },
    context: { prisma: typeof db },
  ) => {
    const limit = args?.limit || DEFAULT_COMPONENT_SIZE;
    const numberPage = args?.numberPage || 1;
    return await context.prisma.component.findMany({
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
  },
};

export default queries;
