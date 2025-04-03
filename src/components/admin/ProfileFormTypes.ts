
import { z } from "zod";

export const profileFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  company: z.string().optional(),
  address: z.string().optional(),
  bio: z.string().optional(),
  customId: z.string().optional(),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
