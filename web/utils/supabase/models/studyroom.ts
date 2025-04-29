import { z } from "zod";

export const StudyRoom = z.object({
  id: z.string(),
  course_id: z.string(),
  title: z.string(),
  creator_id: z.string(),
});

export type StudyRoom = z.infer<typeof StudyRoom>;
