import { ApolloServer } from "@apollo/server";
import responseCachePlugin from "@apollo/server-plugin-response-cache";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import resolvers from "@/lib/graphql/resolvers";
import typeDefs from "@/lib/graphql/schema/typeDefs";
import { db } from "@/lib/db";
import { NextRequest } from "next/server";
import { cache } from "@/lib/apollo/cache";
import { CART_HEADER_KEY, USER_HEADER_KEY } from "@/lib/constants";
import { stripe } from "@/lib/stripe/stripe";

type ApolloContext = {
  req: NextRequest;
  prisma: typeof db;
};

const server = new ApolloServer<ApolloContext>({
  introspection: true,
  typeDefs,
  csrfPrevention: false,
  resolvers,
  cache,
  plugins: [
    responseCachePlugin({
      sessionId: async (requestContext) =>
        requestContext?.request?.http?.headers.get("session-id") || null,
      cache,
    }),
  ],
});

const handler = startServerAndCreateNextHandler<NextRequest, ApolloContext>(
  server,
  {
    context: async (req) => ({
      req,
      prisma: db,
      userId: req.headers.get(USER_HEADER_KEY),
      cartId: req.headers.get(CART_HEADER_KEY),
      stripe: stripe,
    }),
  },
);

export async function GET(req: NextRequest) {
  return handler(req);
}

export async function POST(req: NextRequest) {
  return handler(req);
}
