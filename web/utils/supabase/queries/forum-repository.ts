import { SupabaseClient } from "@supabase/supabase-js";
import { ForumRepository } from "@/utils/supabase/models/forum-repository";
import { z } from "zod";

export const getForumRepository = async (
  supabase: SupabaseClient,
  courseId: string
): Promise<z.infer<typeof ForumRepository>> => {
  const { data: forumRepository, error: forumRepositoryError } = await supabase
    .from("forum_repository")
    .select("*")
    .eq("course_id", courseId)
    .single();

  if (forumRepositoryError || !forumRepository) {
    throw new Error(`Error fetching profile: ${forumRepositoryError?.message}`);
  }
  return ForumRepository.parse(forumRepository);
};
