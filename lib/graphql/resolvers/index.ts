import { GraphQLJSON } from "graphql-type-json";

import userQueries from "@/lib/graphql/resolvers/query/userQueries";
import categoryQueries from "@/lib/graphql/resolvers/query/categoryQueries";
import componentQueries from "@/lib/graphql/resolvers/query/componentQueries";
import productQueries from "@/lib/graphql/resolvers/category/productQueries";
import cartQueries from "@/lib/graphql/resolvers/query/cartQueries";
import type { IExecutableSchemaDefinition } from "@graphql-tools/schema";
import cartMutations from "@/lib/graphql/resolvers/mutation/cartMutations";
import itemMutations from "@/lib/graphql/resolvers/mutation/cart/itemMutations";
import shippingMutations from "@/lib/graphql/resolvers/mutation/cart/shippingMutations";
import userMutations from "@/lib/graphql/resolvers/mutation/cart/userMutations";

const resolvers: IExecutableSchemaDefinition["resolvers"] = {
  JSON: GraphQLJSON,
  Query: {
    ...userQueries,
    ...categoryQueries,
    ...componentQueries,
    ...productQueries,
    ...cartQueries,
  },
  Mutation: {
    ...cartMutations,
  },
  Category: {
    ...productQueries,
  },
  MutationCart: {
    ...itemMutations,
    ...shippingMutations,
    ...userMutations,
  },
};

export default resolvers;
