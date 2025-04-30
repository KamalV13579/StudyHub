import { z } from "zod";

export const ForumMembershipSchema = z.object({
  forum_id: z.string().uuid(),
  profile_id: z.string().uuid(),
  is_anonymous: z.boolean(),
});

export type ForumMembership = z.infer<typeof ForumMembershipSchema>;
