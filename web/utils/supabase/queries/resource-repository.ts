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
    .select("*")
    .eq("repository_id", repositoryId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  console.log(data)
  return Resource.array().parse(data);
};

export const getResourceDetail = async (
  supabase: SupabaseClient,
  resourceId: string
): Promise<z.infer<typeof Resource>> => {
  const { data, error } = await supabase
    .from("resource")
    .select("*")
    .eq("id", resourceId)
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Resource not found");
  }
  return Resource.parse(data);
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

// TODO when the comments table for resources is created

export const getCommentsForResource = async (supabase: SupabaseClient, resourceId: string) => {
  const { data, error } = await supabase
    .from("comments")
    .select("id, content, author_name")
    .eq("resource_id", resourceId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
};

export const createComment = async (supabase: SupabaseClient, resourceId: string, content: string) => {
  const { error } = await supabase
    .from("comments")
    .insert([{ resource_id: resourceId, content, author_name: "Anonymous" }]);

  if (error) throw new Error(error.message);
};
