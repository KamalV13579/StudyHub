import { SupabaseClient } from "@supabase/supabase-js";
import { ResourceRepository } from "@/utils/supabase/models/resource-repository";
import { z } from "zod";
import { Resource } from "@/utils/supabase/models/resource";

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

export const getResourceRepositoryById = async (
  supabase: SupabaseClient,
  repositoryId: string
): Promise<z.infer<typeof ResourceRepository>> => {
  const { data, error } = await supabase
    .from("resource_repository")
    .select("*")
    .eq("id", repositoryId)
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Resource repository not found");
  }

  return ResourceRepository.parse(data);
};

export const getResourcesForRepository = async (
  supabase: SupabaseClient,
  repositoryId: string
): Promise<z.infer<typeof Resource>[]> => {
  const { data, error } = await supabase
    .from("resource")
    .select(
      `
    id,
    title,
    description,
    type,
    uploaded_by,
    file_url,
    created_at,
    repository_id,
    profiles:uploaded_by (
      handle
    )
  `
    )
    .eq("repository_id", repositoryId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  if (!data) return [];

  // flatten profiles.handle onto the root object
  const withHandle = data.map((r: unknown) => ({
    ...(r as Record<string, unknown>),
    handle: (r as { profiles?: { handle?: string } }).profiles?.handle ?? null,
  }));
  return Resource.array().parse(withHandle);
};

export const getResourceDetail = async (
  supabase: SupabaseClient,
  resourceId: string
): Promise<z.infer<typeof Resource>> => {
  const { data, error } = await supabase
    .from("resource")
    .select(
      `
    id,
    title,
    description,
    type,
    uploaded_by,
    file_url,
    created_at,
    repository_id,
    profiles:uploaded_by (
      handle
    )
  `
    )
    .eq("id", resourceId);

  if (error) throw new Error(error.message);

  const withHandle = data.map((r: unknown) => ({
    ...(r as Record<string, unknown>),
    handle: (r as { profiles?: { handle?: string } }).profiles?.handle ?? null,
  }));
  console.log(withHandle);

  const firstResource = withHandle[0];
  console.log(withHandle);
  console.log(firstResource);
  return Resource.parse(firstResource);
};

export const uploadResourceFile = async (
  supabase: SupabaseClient,
  file: File,
  resourceId: string
): Promise<string> => {
  const filePath = `${resourceId}/${file.name}`;

  const { data, error } = await supabase.storage
    .from("resources")
    .upload(filePath, file, {
      upsert: true,
    });

  if (error) throw new Error(error.message);
  return data.path;
};

export const createResourceEntry = async (
  supabase: SupabaseClient,
  resourceData: {
    title: string;
    description: string;
    uploaded_by: string;
    repository_id: string;
    file_url: string;
    type: string;
  }
) => {
  const { error } = await supabase.from("resource").insert([resourceData]);

  if (error) throw new Error(error.message);
};

export const handleResourceVote = async (
  supabase: SupabaseClient,
  resourceId: string,
  profileId: string,
  voteValue: 1 | -1
) => {
  const { data: existingVote, error: fetchError } = await supabase
    .from("resource_vote")
    .select("id, vote")
    .eq("resource_id", resourceId)
    .eq("profile_id", profileId);

  if (fetchError) {
    console.log("fetch error");
    throw new Error(fetchError.message);
  }

  if (existingVote.length === 0) {
    const { error: insertError } = await supabase.from("resource_vote").insert([
      {
        resource_id: resourceId,
        profile_id: profileId,
        vote: voteValue,
      },
    ]);
    if (insertError) {
      console.log("insert error");
      throw new Error(insertError.message);
    }
  } else if (existingVote[0].vote === voteValue) {
    // this update is a work around to have it to the realtime works on deletes
    const { error: updateError } = await supabase
      .from("resource_vote")
      .update({ vote: 0 })
      .eq("id", existingVote[0].id);
    if (updateError) {
      console.log("update error");
      throw new Error(updateError.message);
    }
    const { error: deleteError } = await supabase
      .from("resource_vote")
      .delete()
      .eq("id", existingVote[0].id);
    if (deleteError) {
      console.log("delete error");
      throw new Error(deleteError.message);
    }
  } else {
    const { error: updateError } = await supabase
      .from("resource_vote")
      .update({ vote: voteValue })
      .eq("id", existingVote[0].id);
    if (updateError) {
      console.log("update error");
      throw new Error(updateError.message);
    }
  }
};

export const getResourceVoteCount = async (
  supabase: SupabaseClient,
  resourceId: string
): Promise<number> => {
  const { data, error } = await supabase
    .from("resource_vote")
    .select("vote")
    .eq("resource_id", resourceId);

  if (error) throw new Error(error.message);

  if (!data) return 0;

  const total = data.reduce((sum, v) => sum + (v.vote ?? 0), 0);
  return total;
};

export const getUserResourceVote = async (
  supabase: SupabaseClient,
  resourceId: string,
  profileId: string
): Promise<1 | -1 | null> => {
  const { data, error } = await supabase
    .from("resource_vote")
    .select("vote")
    .eq("resource_id", resourceId)
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    throw new Error(error.message);
  }

  return data?.vote ?? null;
};

export const deleteResource = async (
  supabase: SupabaseClient,
  resourceId: string
) => {
  const { error } = await supabase
    .from("resource")
    .delete()
    .eq("id", resourceId);

  if (error) {
    throw new Error(error.message);
  }
};

