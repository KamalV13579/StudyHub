import { z } from "zod";

export const ResourceRepository = z.object({
  id: z.string(),
  course_id: z.string(),
});
