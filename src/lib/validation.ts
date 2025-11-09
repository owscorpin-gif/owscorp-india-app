import { z } from "zod";

// Platform enum for validation
export const platformEnum = z.enum([
  "Website",
  "Android App",
  "iOS App",
  "Mac Application",
  "Windows Application",
  "Linux Application",
  "AI Service",
  "Automation Tool"
]);

// Service validation schema
export const serviceSchema = z.object({
  platform: platformEnum,
  title: z.string()
    .trim()
    .min(10, "Title must be at least 10 characters")
    .max(100, "Title must be less than 100 characters")
    .refine(val => !/<script|javascript:/i.test(val), "Invalid characters detected"),
  description: z.string()
    .trim()
    .min(50, "Description must be at least 50 characters")
    .max(5000, "Description must be less than 5000 characters")
    .refine(val => !/<script|javascript:/i.test(val), "Invalid characters detected"),
  category: z.string()
    .max(50, "Category must be less than 50 characters")
    .optional(),
  price: z.number()
    .positive("Price must be positive")
    .min(0.99, "Minimum price is $0.99")
    .max(9999.99, "Maximum price is $9999.99"),
  features: z.array(
    z.string()
      .max(200, "Feature must be less than 200 characters")
      .refine(val => !/<script|javascript:/i.test(val), "Invalid characters detected")
  ).max(10, "Maximum 10 features allowed"),
  tags: z.array(
    z.string()
      .max(50, "Tag must be less than 50 characters")
      .refine(val => !/<script|javascript:/i.test(val), "Invalid characters detected")
  ).max(5, "Maximum 5 tags allowed"),
  status: z.enum(["draft", "published"]).optional()
});

export type ServiceFormData = z.infer<typeof serviceSchema>;
