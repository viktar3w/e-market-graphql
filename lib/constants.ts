export const CART_COOKIE_KEY = "cartToken" as const;
export const SIGN_OUT_KEY = "signOut";
export const CART_LOCALSTORAGE = "cart" as const;

export const USER_HEADER_KEY = 'X-USER-ID' as const;
export const CART_HEADER_KEY = 'X-CART-ID' as const;

export const DEFAULT_COMPONENT_SIZE = 10 as const;
export const DEFAULT_PRODUCT_SIZE = 10 as const;
export const DEFAULT_PRODUCT_NUMBER_PAGE = 1 as const;

export const MIN_PRICE = 0 as const;
export const MAX_PRICE = 3000 as const;
export const PRICE_STEP = 10 as const;

export const CHECKBOX_ITEMS_LIMIT = 5 as const;

export const GET_ID_KEY = "variant" as const;
export const DEFAULT_EMPTY_PRODUCT_IMAGE =
  "/products/default_product_img.png" as const;

export const DEFAULT_TYPES_LIMIT = 6 as const;

export const SUPPORT_FREE_LIMIT = {
  maxEventsPerMonth: 100,
  maxEventsCategories: 3,
} as const;

export const SUPPORT_PRO_LIMIT = {
  maxEventsPerMonth: 1000,
  maxEventsCategories: 10,
} as const;

export const BLOCK_DURATION = 3600000 as const;
export const ATTEMPT_LIMIT = 5 as const;

export const TELEGRAM_AUTH = "/auth" as const;
export const TELEGRAM_COMMANDS: Record<string, string> = {
  [TELEGRAM_AUTH]: "message: `/auth <YOUR_SUPPORT_TOKEN>`",
};
export const TIME_RANGE_LABELS = {
  today: "today",
  week: "this week",
  month: "this month",
};
