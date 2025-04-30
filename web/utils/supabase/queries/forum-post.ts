import { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { ForumSchema } from "@/utils/supabase/models/forum";
import { ForumPostSchema } from "@/utils/supabase/models/forum-post";
import { getForums } from "@/utils/supabase/queries/forum";

export const getForumPost = async (
  supabase: SupabaseClient,
  forumId: string,
): Promise<z.infer<typeof ForumPostSchema>> => {
  const { data, error } = await supabase
    .from("forum_post")
    .select("*")
    .eq("forum_id", forumId)
    .single();
  if (error || !data) throw new Error(error?.message);
  return ForumPostSchema.parse(data);
};

export const getForumPostsByRepositoryId = async (
  supabase: SupabaseClient,
  repositoryId: string,
): Promise<z.infer<typeof ForumPostSchema>[]> => {
  const forums = await getForums(supabase, repositoryId);
  if (!forums) throw new Error("No forums found");

  const forumIds = forums.map((forum: z.infer<typeof ForumSchema>) => forum.id);
  const { data, error } = await supabase
    .from("forum_post")
    .select("*")
    .in("forum_id", forumIds);

  if (error) throw new Error(error.message);
  return z.array(ForumPostSchema).parse(data);
};

export const createForumPost = async (
  supabase: SupabaseClient,
  forumId: string,
  authorId: string,
  title: string,
  content: string,
  attachmentUrl: string | null = null,
): Promise<z.infer<typeof ForumPostSchema>> => {
  const payload = {
    forum_id: forumId,
    author_id: authorId,
    title: title,
    content: content,
    attachment_url: attachmentUrl,
  };
  const { data, error } = await supabase
    .from("forum_post")
    .insert(payload)
    .select()
    .single();
  if (error || !data) throw new Error(error?.message);
  return ForumPostSchema.parse(data);
};

export const deleteForumPost = async (
  supabase: SupabaseClient,
  postId: string,
): Promise<void> => {
  const { error } = await supabase.from("forum_post").delete().eq("id", postId);
  if (error) throw new Error(error.message ?? "Failed to delete forum post");
};
