import { InMemoryLRUCache } from "@apollo/utils.keyvaluecache";
const createCache = () => {
  return new InMemoryLRUCache();
};

declare global {
  // eslint-disable-next-line no-var
  var cacheGlobal: undefined | ReturnType<typeof createCache>;
}

export const cache = createCache();

if (process.env.NODE_ENV !== "production") globalThis.cacheGlobal = cache;
