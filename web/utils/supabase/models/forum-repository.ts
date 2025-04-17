import { z } from "zod";

export const ForumRepository = z.object({
  id: z.string(),
  course_id: z.string(),
});

export type ForumRepository = z.infer<typeof ForumRepository>;
