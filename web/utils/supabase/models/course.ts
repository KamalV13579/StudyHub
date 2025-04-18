import { z } from "zod";

export const Course = z.object({
  id: z.string(),
  course_code: z.string(),
  course_name: z.string(),
});

export type Course = z.infer<typeof Course>;
