import { SupabaseClient } from "@supabase/supabase-js";
import { ResourceRepository } from "@/utils/supabase/models/resource-repository";
import { z } from "zod";

export const getResourceRepository = async (
  supabase: SupabaseClient,
  courseId: string
): Promise<z.infer<typeof ResourceRepository>> => {
  const { data: resourceRepository, error: resourceRepositoryError } =
    await supabase
      .from("resource_repository")
      .select("*")
      .eq("course_id", courseId)
      .single();

  if (resourceRepositoryError || !resourceRepository) {
    throw new Error(
      `Error fetching profile: ${resourceRepositoryError?.message}`
    );
  }
  return ResourceRepository.parse(resourceRepository);
};
