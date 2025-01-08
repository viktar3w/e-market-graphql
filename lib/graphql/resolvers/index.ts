import { GraphQLJSON } from "graphql-type-json";

import userQueries from "@/lib/graphql/resolvers/query/userQueries";
import categoryQueries from "@/lib/graphql/resolvers/query/categoryQueries";
import componentQueries from "@/lib/graphql/resolvers/query/componentQueries";
import productQueries from "@/lib/graphql/resolvers/category/productQueries";

const resolvers = {
  JSON: GraphQLJSON,
  Query: {
    ...userQueries,
    ...categoryQueries,
    ...componentQueries,
    ...productQueries
  },
  Category: {
    ...productQueries
  }
};

export default resolvers;
