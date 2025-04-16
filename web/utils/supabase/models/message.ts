
import { z } from "zod";
import { Profile } from "./profile";
import { StudyRoom } from "./studyroom";

export const Message = z.object({
    id: z.string(),
    study_room: StudyRoom,
    author: Profile,
    content: z.string(),
    attachment_url: z.string().nullable(),
    created_at: z.date({ coerce: true }).nullable().default(null),
})

export const DraftMessage = z.object({
    id: z.string(),
    study_room_id: z.string(),
    author_id: z.string(),
    content: z.string(),
    attachment_url: z.string().nullable(),
    created_at: z.date({ coerce: true }).nullable().default(null),
})