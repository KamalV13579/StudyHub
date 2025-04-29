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

export const createForumComment = async (
  supabase: SupabaseClient,
  commentData: {
    post_id: string;
    author_id: string;
    content: string;
  }
): Promise<z.infer<typeof ForumCommentSchema>> => {
  const payload = {
    post_id: commentData.post_id,
    author_id: commentData.author_id,
    content: commentData.content,
  };
  const { data, error } = await supabase.from("forum_comment").insert(payload).select().single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create forum comment");
  }
  return ForumCommentSchema.parse(data);
};

export const deleteForumComment = async (supabase: SupabaseClient, commentId: string): Promise<void> => {
  const { error } = await supabase.from("forum_comment").delete().eq("id", commentId);
  if (error) throw new Error(error.message ?? "Failed to delete forum comment");
};
