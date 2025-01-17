import { z } from "zod"

export const CATEGORY_NAME_VALIDATOR = z
  .string()
  .min(3, "Category name is required.")
  .max(50)
  .regex(
    /^[a-zA-Z0-9-]+$/,
    "Category name can only contain letters, numbers or hypens."
  )