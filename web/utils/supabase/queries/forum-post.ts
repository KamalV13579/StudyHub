import { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { ForumPostSchema } from "@/utils/supabase/models/forum-post";

export const getForumPosts = async (
  supabase: SupabaseClient,
  forumId: string
): Promise<z.infer<typeof ForumPostSchema>[]> => {
  const { data, error } = await supabase.from("forum_post").select("*").eq("forum_id", forumId);
  if (error) throw new Error(error.message);
  return z.array(ForumPostSchema).parse(data);
};

export const getForumPost = async (
  supabase: SupabaseClient,
  postId: string
): Promise<z.infer<typeof ForumPostSchema>> => {
  const { data, error } = await supabase.from("forum_post").select("*").eq("id", postId).single();
  if (error || !data) throw new Error(error?.message);
  return ForumPostSchema.parse(data);
};

export const createForumPost = async (
  supabase: SupabaseClient,
  forumId: string,
  authorId: string,
  title: string,
  content: string,
  attachmentUrl: string | null = null
): Promise<z.infer<typeof ForumPostSchema>> => {
  const payload = {
    forum_id: forumId,
    author_id: authorId,
    title,
    content,
    attachment_url: attachmentUrl,
  };
  const { data, error } = await supabase.from("forum_post").insert(payload).single();
  if (error || !data) throw new Error(error?.message);
  return ForumPostSchema.parse(data);
};
