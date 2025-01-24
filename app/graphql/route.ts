import { ApolloServer } from "@apollo/server";
import responseCachePlugin from "@apollo/server-plugin-response-cache";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { auth } from "@clerk/nextjs/server";
import resolvers from "@/lib/graphql/resolvers";
import typeDefs from "@/lib/graphql/schema/typeDefs";
import { db } from "@/lib/db";
import { NextRequest } from "next/server";
import { cache } from "@/lib/apollo/cache";
import { CART_COOKIE_KEY } from "@/lib/constants";
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
    context: async (req) => {
      const { userId } = await auth();
      return {
        req,
        prisma: db,
        userId,
        cartId: req.cookies.get(CART_COOKIE_KEY),
        stripe: stripe,
      };
    },
  },
);

export async function GET(req: NextRequest) {
  return handler(req);
}

export async function POST(req: NextRequest) {
  return handler(req);
}
