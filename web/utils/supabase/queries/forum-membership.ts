import { SupabaseClient } from "@supabase/supabase-js";
import { ForumMembershipSchema, ForumMembership } from "@/utils/supabase/models/forum-membership";

export const upsertForumMembership = async (
  supabase: SupabaseClient,
  forumId: string,
  profileId: string,
  isAnonymous: boolean
): Promise<ForumMembership> => {
  const { data, error } = await supabase
    .from("forum_membership")
    .upsert(
      { forum_id: forumId, profile_id: profileId, is_anonymous: isAnonymous },
      { onConflict: "forum_id, profile_id" }
    )
    .select()
    .single();

  if (error) throw new Error(`Failed to upsert forum membership: ${error.message}`);
  if (!data) throw new Error("Upsert operation did not return the expected data.");

  return ForumMembershipSchema.parse(data);
};

export const getOrUpsertForumMembershipAnonymousStatus = async (
  supabase: SupabaseClient,
  forumId: string,
  profileId: string
): Promise<boolean> => {
  const { data: existingMembership, error: selectError } = await supabase
    .from("forum_membership")
    .select("is_anonymous")
    .eq("forum_id", forumId)
    .eq("profile_id", profileId)
    .maybeSingle();

  if (selectError) throw new Error(`Failed to fetch forum membership: ${selectError.message}`);
  if (existingMembership) return existingMembership.is_anonymous;

  const defaultIsAnonymous = false;
  await upsertForumMembership(supabase, forumId, profileId, defaultIsAnonymous);

  return defaultIsAnonymous;
};
