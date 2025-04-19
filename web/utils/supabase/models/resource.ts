import { z } from "zod";

export const Resource = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  type: z.string(),
  uploaded_by: z.string(),
  file_url: z.string().nullable(),
  created_at: z.string(),
  repository_id: z.string(),
});

export type Resource = z.infer<typeof Resource>;

