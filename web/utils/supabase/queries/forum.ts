import { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { ForumSchema } from "@/utils/supabase/models/forum";

export const createForum = async (
  supabase: SupabaseClient,
  courseId: string,
  repositoryId: string,
  title: string
): Promise<z.infer<typeof ForumSchema>> => {
  const payload = {
    course_id: courseId,
    repository_id: repositoryId,
    title,
  };

  const { data, error } = await supabase.from("forums").insert(payload).single();
  if (error || !data) throw new Error(error.message);

  return ForumSchema.parse(data);
};
