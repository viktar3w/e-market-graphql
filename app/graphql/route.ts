import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import resolvers from "@/lib/graphql/resolvers";
import typeDefs from "@/lib/graphql/schema/typeDefs";
import { db } from "@/lib/db";
import { NextRequest } from "next/server";

type ApolloContext = {
  req: NextRequest;
  prisma: typeof db;
}

const server = new ApolloServer<ApolloContext>({
  typeDefs,
  csrfPrevention: false,
  resolvers,
});

const handler = startServerAndCreateNextHandler<NextRequest, ApolloContext>(server, {
  context: async (req) => ({
    req,
    prisma: db,
  }),
});

export async function GET(req: NextRequest) {
  return handler(req);
}

export async function POST(req: NextRequest) {
  return handler(req);
}