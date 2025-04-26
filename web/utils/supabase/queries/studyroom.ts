import { SupabaseClient } from "@supabase/supabase-js";
import { StudyRoom } from "@/utils/supabase/models/studyroom";
import { z } from "zod";
import { Profile } from "../models/profile";

// Retrieves the list of study rooms the current user has joined.
export const getStudyRooms = async (
  supabase: SupabaseClient,
  courseId: string,
  userId: string
): Promise<z.infer<typeof StudyRoom>[]> => {
  // Fetch study room membership entries for the current user.
  const { data: membershipData, error: membershipError } = await supabase
    .from("study_room_membership")
    .select("study_room_id")
    .eq("profile_id", userId);

  if (membershipError || !membershipData) {
    throw new Error(
      `Error fetching study room memberships: ${membershipError?.message}`
    );
  }

  const studyRoomIds = membershipData.map(
    (membership: { study_room_id: string }) => membership.study_room_id
  );

  const { data: studyRooms, error: studyRoomError } = await supabase
    .from("study_room")
    .select("*")
    .in("id", studyRoomIds)
    .eq("course_id", courseId);

  if (studyRoomError || !studyRooms) {
    throw new Error(`Error fetching study rooms: ${studyRoomError?.message}`);
  }

  return studyRooms as z.infer<typeof StudyRoom>[];
};

export type JoinedStudyRoom = z.infer<typeof StudyRoom> & {
  alreadyJoined: boolean;
};

export const joinStudyRoom = async (
  supabase: SupabaseClient,
  studyRoomId: string,
  courseId: string,
  userId: string
): Promise<JoinedStudyRoom> => {
  // Look up the study room by its id.
  const { data: studyRoom, error: studyRoomError } = await supabase
    .from("study_room")
    .select("*")
    .eq("id", studyRoomId)
    .single();

  if (studyRoomError || !studyRoom) {
    throw new Error(`Study room not found: ${studyRoomId}`);
  }

  // Ensure the study room belongs to the specified course.
  if (studyRoom.course_id !== courseId) {
    throw new Error("Study room does not belong to the specified course.");
  }

  // Check if the user is already a member of the study room.
  const { data: existingMembership, error: membershipQueryError } =
    await supabase
      .from("study_room_membership")
      .select("*")
      .eq("profile_id", userId)
      .eq("study_room_id", studyRoom.id)
      .maybeSingle();

  if (membershipQueryError) {
    console.error(
      "[joinStudyRoom] Error checking existing membership:",
      membershipQueryError
    );
  }

  if (existingMembership) {
    return { ...studyRoom, alreadyJoined: true } as JoinedStudyRoom;
  }

  // Insert a membership record so the user joins the study room.
  const { error: membershipInsertError } = await supabase
    .from("study_room_membership")
    .insert([
      {
        profile_id: userId,
        study_room_id: studyRoom.id,
        is_owner: false, // If not creator, set false
        course_id: studyRoom.course_id,
      },
    ]);

  if (membershipInsertError) {
    throw new Error(
      `Error joining study room: ${membershipInsertError.message}`
    );
  }

  return { ...studyRoom, alreadyJoined: false } as JoinedStudyRoom;
};

export const createStudyRoom = async (
  supabase: SupabaseClient,
  roomTitle: string,
  courseId: string,
  userId: string
): Promise<z.infer<typeof StudyRoom>> => {
  // Insert a new study room record.
  const { data: studyRoom, error: roomError } = await supabase
    .from("study_room")
    .insert([
      {
        course_id: courseId,
        title: roomTitle,
      },
    ])
    .select() // Return the inserted record.
    .single();

  if (roomError || !studyRoom) {
    throw new Error(`Error creating study room: ${roomError?.message}`);
  }

  // Insert a new row into study_room_membership to add the creator as a member.
  const { error: membershipError } = await supabase
    .from("study_room_membership")
    .insert([
      {
        study_room_id: studyRoom.id,
        profile_id: userId,
        is_owner: true, // Set the creator as the owner.
        course_id: studyRoom.course_id,
      },
    ]);

  if (membershipError) {
    throw new Error(
      `Error adding study room membership: ${membershipError.message}`
    );
  }

  return studyRoom as z.infer<typeof StudyRoom>;
};

export const getStudyRoom = async (
  supabase: SupabaseClient,
  studyRoomId: string
): Promise<z.infer<typeof StudyRoom>> => {
  // Fetch study room with creator information
  const { data, error } = await supabase
    .from("study_room")
    .select(
      `
      *,
      creator:study_room_membership!inner(
        profile_id
      )
    `
    )
    .eq("id", studyRoomId)
    .eq("study_room_membership.is_owner", true)
    .maybeSingle();

  if (error || !data) {
    throw new Error(`Error fetching study room: ${error?.message}`);
  }

  // Map the result to include creator_id
  return {
    id: data.id,
    course_id: data.course_id,
    title: data.title,
    creator_id: data.creator[0]?.profile_id,
  } as z.infer<typeof StudyRoom>;
};

export const getStudyRoomMembers = async (
  supabase: SupabaseClient,
  studyRoomId: string
) => {
  const query = supabase
    .from("study_room_membership")
    .select(
      `
        profile:profile!profile_id ( id, name, handle, avatar_url, major, created_at),
        is_owner
      `
    )
    .eq("study_room_id", studyRoomId);

  const { data: studyRoomMembers, error: studyRoomMembersError } = await query;

  if (studyRoomMembersError) {
    throw new Error(
      `Error feetching server members: ${studyRoomMembersError.message}`
    );
  }

  const members = z
    .object({
      profile: Profile,
    })
    .array()
    .parse(studyRoomMembers);
  return members.map((member) => member.profile);
};

export const updateStudyRoomName = async (
  supabase: SupabaseClient,
  studyRoomId: string,
  newName: string
): Promise<void> => {
  const { error } = await supabase
    .from("study_room")
    .update({ title: newName })
    .eq("id", studyRoomId);

  if (error) {
    throw new Error(`Error updating study room name: ${error.message}`);
  }
};

export const deleteStudyRoom = async (
  supabase: SupabaseClient,
  studyRoomId: string
): Promise<void> => {
  const { error } = await supabase
    .from("study_room")
    .delete()
    .eq("id", studyRoomId);

  if (error) {
    throw new Error(`Error deleting study room: ${error.message}`);
  }
};

export const leaveStudyRoom = async (
  supabase: SupabaseClient,
  studyRoomId: string,
  userId: string
): Promise<void> => {
  // Delete the row in the study_room_membership table for this user and studyRoomId.
  const { error: deleteError } = await supabase
    .from("study_room_membership")
    .delete()
    .eq("study_room_id", studyRoomId)
    .eq("profile_id", userId);

  if (deleteError) {
    throw new Error(`Error leaving study room: ${deleteError.message}`);
  }
};

// In utils/supabase/queries/studyroom.ts
export const getStudyRoomsByMembership = async (
  supabase: SupabaseClient,
  userId: string,
  courseId: string
): Promise<StudyRoom[]> => {
  const { data, error } = await supabase
    .from("study_room_membership")
    .select("study_room(*)")
    .eq("profile_id", userId)
    .eq("study_room.course_id", courseId);

  if (error) throw error;
  return data.flatMap((d) => d.study_room) as StudyRoom[];
};
