import { db } from "@/lib/db";

const queries = {
  users: async (
    _parent: unknown,
    _args: unknown,
    context: { prisma: typeof db },
  ) => {
    return await context.prisma.user.findMany();
  },
};

export default queries;
