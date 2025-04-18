import { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { DraftMessage, Message } from "../models/message";

// TODO: Add reaction queries

export const getPaginatedMessages = async (
  supabase: SupabaseClient,
  studyRoomId: string,
  cursor: number,
  textSearch?: string
): Promise<z.infer<typeof Message>[]> => {
  const query = supabase
    .from("study_room_message")
    .select(
      `
      id,
      content,
      created_at,
      attachment_url,
      author_id,
      study_room_id,
      author:profile!author_id ( id, name, handle, avatar_url, major, created_at )
    `
    )
    .eq("study_room_id", studyRoomId)
    .order("created_at", { ascending: false })
    .range(cursor, cursor + 49);

  if (textSearch) {
    query.textSearch("content", textSearch);
  }

  const { data: messages, error: messagesError } = await query;
  if (messagesError) {
    throw new Error(`Error fetching messages: ${messagesError.message}`);
  }

  console.log("Raw messages from Supabase:", messages);

  return Message.array().parse(messages);
};

export const sendMessage = async (
  supabase: SupabaseClient,
  draftMessage: z.infer<typeof DraftMessage>,
  file: File | null
) => {
  // Step 1: Insert the message (without selecting complex nested joins)
  const { data: message, error } = await supabase
    .from("study_room_message")
    .insert(draftMessage)
    .select(
      `
        id,
        content,
        created_at,
        attachment_url,
        author_id,
        study_room_id
        `
    )
    .single();

  if (error) {
    throw new Error(`Error inserting message: ${error.message}`);
  }

  if (file && message) {
    const { data: fileData, error: uploadError } = await supabase.storage
      .from("attachments")
      .upload(`${message.id}`, file);

    if (uploadError) {
      throw new Error(`File upload failed: ${uploadError.message}`);
    }

    if (fileData) {
      const { data: updatedMessage, error } = await supabase
        .from("study_room_message")
        .update({
          attachment_url: supabase.storage
            .from("attachments")
            .getPublicUrl(fileData.path).data.publicUrl,
        })
        .eq("id", message.id)
        .select(
          `
            id,
            content,
            created_at,
            attachment_url,
            author_id,
            study_room_id
            `
        ) // Add this to return the updated message
        .single();

      if (error) throw Error(error.message);

      // Make sure we're returning a non-null value that matches DraftMessage schema
      return DraftMessage.parse(updatedMessage);
    }
  }

  // Always return the message, whether it was updated with an attachment or not
  return DraftMessage.parse(message);
};
