import { SupabaseClient } from "@supabase/supabase-js";
import { Profile } from "@/utils/supabase/models/profile";
import { z } from "zod";

export const getProfile = async (
  supabase: SupabaseClient,
  userId: string
): Promise<z.infer<typeof Profile>> => {
  const { data: profile, error: profileError } = await supabase
    .from("profile")
    .select("*")
    .eq("id", userId)
    .single();

  if (profileError || !profile) {
    throw new Error(`Error fetching profile: ${profileError?.message}`);
  }
  return Profile.parse(profile);
};

export const changeProfileDisplayName = async (
  supabase: SupabaseClient,
  newName: string,
  userId: string
): Promise<void> => {
  const { error: updateError } = await supabase
    .from("profile")
    .update({ name: newName })
    .eq("id", userId)
    .single();

  if (updateError) {
    throw new Error(`Error updating display name: ${updateError?.message}`);
  }
};

export const changeProfileImage = async (
  supabase: SupabaseClient,
  file: File,
  userId: string
): Promise<void> => {
  const { data: fileData, error: uploadError } = await supabase.storage
    .from("avatars")
    .update(`${file.name}`, file, { upsert: true });

  if (uploadError) throw Error(uploadError.message);

  const { error: updateError } = await supabase
    .from("profile")
    .update({
      avatar_url: supabase.storage.from("avatars").getPublicUrl(fileData.path, {
        transform: {
          width: 300,
          height: 300,
        },
      }).data.publicUrl,
    })
    .eq("id", userId);

  if (updateError) {
    throw new Error(`Error updating profile image: ${updateError.message}`);
  }
};
