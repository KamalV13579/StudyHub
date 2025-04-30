import { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { ForumSchema } from "@/utils/supabase/models/forum";

export const getForum = async (
  supabase: SupabaseClient,
  forumId: string,
): Promise<z.infer<typeof ForumSchema>> => {
  const { data, error } = await supabase
    .from("forum")
    .select("*")
    .eq("id", forumId)
    .single();
  if (error) throw new Error(error.message);

  if (!data) throw new Error("Forum not found");
  return ForumSchema.parse(data);
};

export const getForums = async (
  supabase: SupabaseClient,
  repositoryId: string,
): Promise<z.infer<typeof ForumSchema>[]> => {
  const { data, error } = await supabase
    .from("forum")
    .select("*")
    .eq("repository_id", repositoryId);

  if (error || !data)
    throw new Error(error?.message ?? "Unknown error occurred");
  return z.array(ForumSchema).parse(data);
};

export const createForum = async (
  supabase: SupabaseClient,
  courseId: string,
  repositoryId: string,
  title: string,
): Promise<z.infer<typeof ForumSchema>> => {
  const payload = {
    course_id: courseId,
    repository_id: repositoryId,
    title: title,
  };

  const { data, error } = await supabase
    .from("forum")
    .insert(payload)
    .select()
    .single();
  if (error || !data)
    throw new Error(error?.message ?? "Unknown error occurred");

  return ForumSchema.parse(data);
};

export const deleteForum = async (
  supabase: SupabaseClient,
  forumId: string,
): Promise<void> => {
  const { error } = await supabase.from("forum").delete().eq("id", forumId);
  if (error) throw new Error(error.message);
};
