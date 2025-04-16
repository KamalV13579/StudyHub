

import { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { DraftMessage, Message } from "../models/message";


// TODO: Add reaction queries

export const getPaginatedMessages = async (
    supabase: SupabaseClient,
    study_room_id: string,
    cursor: number,
    textSearch?: string
): Promise<z.infer<typeof Message>[]> => { 
    const query = supabase
        .from("study_room_message")
        .select(
        `
            id,
            study_room:study!study_room_id ( id, course_id, title ),
            author:profile!author_id ( id, name, handle, avatar_url, major, created_at ),
            content,
            created_at,
            attachment_url
         `
        )
        .eq("study_room_id", study_room_id)
        .order("created_at", { ascending: false })
        .range(cursor, cursor + 49);

    if (textSearch) {
        query.textSearch("content", textSearch)
    }

    const { data: messages, error: messagesError } = await query;

    if (messagesError) {
        throw new Error(`Error fetching messgaes: ${messagesError.message}`);
    }

    return Message.array().parse(messages)
}

export const sendMessage = async (
    supabase: SupabaseClient,
    draftMessage: z.infer<typeof DraftMessage>,
    file: File | null,
) => {
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
        throw new Error(`Error sending message: ${error.message}`);
    }

    if (file && message) {
        const { data: fileData, error: uploadError } = await supabase.storage
            .from("attachments")
            .upload(`${message.id}`, file);
    
        if (uploadError) throw Error(uploadError.message);

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
                        study_room_id,
                    `
                )
                .single();
            if (error) throw Error(error.message);

            return DraftMessage.parse(message);
        }
    }
    return DraftMessage.parse(message);
};

