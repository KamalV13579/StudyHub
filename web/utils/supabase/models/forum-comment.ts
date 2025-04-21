import { z } from "zod";

export const ForumCommentSchema = z.object({
  id: z.string().uuid(),
  post_id: z.string().uuid(),
  author_id: z.string().uuid(),
  content: z.string(),
  created_at: z.string().datetime(),
  attachment_url: z.string().nullable(),
});

export type ForumComment = z.infer<typeof ForumCommentSchema>;
