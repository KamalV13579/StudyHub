import { z } from "zod";

export const Profile = z.object({
  id: z.string(),
  name: z.string(),
  handle: z.string(),
  avatar_url: z.string().nullable(),
  major: z.string(),
});
