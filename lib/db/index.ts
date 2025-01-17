import { Pool } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient({
    adapter: new PrismaNeon(
      new Pool({ connectionString: process.env.DATABASE_URL })
    )
  })
};

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const db = globalThis.prismaGlobal ?? prismaClientSingleton();
export type dbType = ReturnType<typeof prismaClientSingleton>

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = db;