import { Social, Support, User } from "@prisma/client";

export type SocialStore = {
  support: { user: User } & Support;
} & Social;
