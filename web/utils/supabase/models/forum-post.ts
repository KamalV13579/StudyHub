import { z } from "zod";

export const ForumPostSchema = z.object({
  id: z.string().uuid(),
  forum_id: z.string().uuid(),
  author_id: z.string().uuid(),
  title: z.string(),
  content: z.string(),
  created_at: z.string(),
  attachment_url: z.string().nullable(),
});

export type ForumPost = z.infer<typeof ForumPostSchema>;
