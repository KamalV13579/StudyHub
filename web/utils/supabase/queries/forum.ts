import { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { ForumSchema } from "@/utils/supabase/models/forum";

export const getForums = async (
  supabase: SupabaseClient,
  repositoryId: string
): Promise<z.infer<typeof ForumSchema>[]> => {
  const { data, error } = await supabase.from("forum").select("*").eq("repository_id", repositoryId);

  if (error || !data) throw new Error(error?.message ?? "Unknown error occurred");
  return z.array(ForumSchema).parse(data);
};

export const createForum = async (
  supabase: SupabaseClient,
  courseId: string,
  repositoryId: string,
  title: string
): Promise<z.infer<typeof ForumSchema>> => {
  const payload = {
    course_id: courseId,
    repository_id: repositoryId,
    title: title,
  };

  const { data, error } = await supabase.from("forum").insert(payload).select().single();
  if (error || !data) throw new Error(error?.message ?? "Unknown error occurred");

  return ForumSchema.parse(data);
};
