import { z } from "zod";

export const SOFTWARE_OPTIONS = ["davinci", "aftereffects", "premiere", "capcut"] as const;
export type Software = typeof SOFTWARE_OPTIONS[number];

export const BRIEF_OPTIONS = ["elgato", "autocont"] as const;
export type Brief = typeof BRIEF_OPTIONS[number];

export const WorkLinkSchema = z.object({
  label: z.string().min(1).max(80),
  url: z.string().url(),
});

export const ApplicationInputSchema = z.object({
  full_name: z.string().min(2).max(120),
  age: z.number().int().min(16).max(80),
  country: z.string().min(2).max(80),
  email: z.string().email().max(200),
  whatsapp: z.string().max(40).optional().nullable(),
  price_per_clip: z.number().nonnegative(),
  currency: z.enum(["EUR", "USD"]),
  software: z.array(z.enum(SOFTWARE_OPTIONS)).min(1),
  experience_years: z.number().int().min(0).max(80),
  experience_text: z.string().max(2000).optional().nullable(),
  work_links: z.array(WorkLinkSchema).max(5).default([]),
  portfolio_url: z.string().url().max(300).optional().nullable(),
  test_video_path: z.string().min(1),
  test_video_size_mb: z.number().nonnegative().optional().nullable(),
  brief: z.enum(BRIEF_OPTIONS),
});

export type ApplicationInput = z.infer<typeof ApplicationInputSchema>;

export const UploadIntentSchema = z.object({
  filename: z.string().min(1).max(200),
  size_bytes: z.number().int().positive().max(120 * 1024 * 1024),
  content_type: z.string().regex(/^video\//),
});

export type UploadIntent = z.infer<typeof UploadIntentSchema>;

export const StatusUpdateSchema = z.object({
  status: z.enum(["pending", "shortlisted", "rejected"]),
  admin_notes: z.string().max(2000).optional().nullable(),
});
