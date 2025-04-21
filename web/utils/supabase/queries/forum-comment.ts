import { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { ForumCommentSchema } from "@/utils/supabase/models/forum-comment";

export const getForumComments = async (
  supabase: SupabaseClient,
  postId: string
): Promise<z.infer<typeof ForumCommentSchema>[]> => {
  const { data, error } = await supabase
    .from("forum_comment")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return z.array(ForumCommentSchema).parse(data);
};
