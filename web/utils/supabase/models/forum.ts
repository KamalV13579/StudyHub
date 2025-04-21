import { z } from "zod";

export const ForumSchema = z.object({
  id: z.string().uuid(),
  course_id: z.string().uuid(),
  title: z.string(),
  repository_id: z.string().uuid(),
});

export type Forum = z.infer<typeof ForumSchema>;
