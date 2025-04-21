import { SupabaseClient } from "@supabase/supabase-js";
import { ResourceRepository } from "@/utils/supabase/models/resource-repository";
import { z } from "zod";
import {Resource} from "@/utils/supabase/models/resource"

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
  .select(`
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
  `)
  .eq("repository_id", repositoryId)
  .order("created_at", { ascending: false });

if (error) throw new Error(error.message);
if (!data) return [];

// flatten profiles.handle onto the root object
const withHandle = data.map((r: any) => ({
  ...r,
  handle: r.profiles?.handle ?? null,
}));
return Resource.array().parse(withHandle);
};

export const getResourceDetail = async (
  supabase: SupabaseClient,
  resourceId: string
): Promise<z.infer<typeof Resource>> => {
  const { data, error } = await supabase
  .from("resource")
  .select(`
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
  `)
  .eq("id", resourceId)

if (error) throw new Error(error.message);

const withHandle = data.map((r: any) => ({
  ...r,
  handle: r.profiles?.handle ?? null,
}));
console.log(withHandle)

const firstResource = withHandle[0]
console.log(withHandle)
console.log(firstResource)
return Resource.parse(firstResource);
};

export const uploadResourceFile = async (
  supabase: SupabaseClient,
  file: File,
  resourceId: string
): Promise<string> => {
  const filePath = `${resourceId}/${file.name}`;

  const { data, error } = await supabase
    .storage
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
  const { error } = await supabase
    .from("resource")
    .insert([resourceData]);

  if (error) throw new Error(error.message);
};


