import * as z from "zod";
export const OnboardingValidation = z.object({
  firstname: z.string().min(3).max(50),
  lastname: z.string().min(3).max(50),
  email: z.string().email(),
  image: z.string().max(255),
  id: z.string().min(3).max(100),
});