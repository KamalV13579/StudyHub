import { Course } from "@/utils/supabase/models/course";
import { z } from "zod";
import { SupabaseClient } from "@supabase/supabase-js";

// Retrieves the list of courses the current user has joined.
export const getCourses = async (
  supabase: SupabaseClient,
  userId: string
): Promise<z.infer<typeof Course>[]> => {
  const { data: membershipData, error: membershipError } = await supabase
    .from("course_membership")
    .select("course_id")
    .eq("profile_id", userId);

  if (membershipError || !membershipData) {
    throw new Error(
      `Error fetching course memberships: ${membershipError?.message}`
    );
  }

  // Extract the list of course IDs.
  const courseIds = membershipData.map(
    (membership: { course_id: string }) => membership.course_id
  );

  // Fetch the full course details from the 'course' table for those IDs.
  const { data: courses, error: coursesError } = await supabase
    .from("course")
    .select("*")
    .in("id", courseIds);

  if (coursesError || !courses) {
    throw new Error(`Error fetching courses: ${coursesError?.message}`);
  }

  return courses as z.infer<typeof Course>[];
};

export type JoinedCourse = z.infer<typeof Course> & { alreadyJoined: boolean };

// Joins a course by its course code.
export const joinCourse = async (
  supabase: SupabaseClient,
  courseCode: string,
  isTutor: boolean = false,
  userId: string
): Promise<JoinedCourse> => {
  // Look up the course by course_code.
  const { data: course, error: courseError } = await supabase
    .from("course")
    .select("*")
    .eq("course_code", courseCode)
    .maybeSingle();

  if (courseError || !course) {
    throw new Error(`Course not found: ${courseCode}`);
  }

  // Check if the user is already a member of the course.
  const { data: existingMembership, error: membershipQueryError } =
    await supabase
      .from("course_membership")
      .select("*")
      .eq("profile_id", userId)
      .eq("course_id", course.id)
      .maybeSingle();

  if (membershipQueryError) {
    console.error(
      "[joinCourse] Error checking existing membership:",
      membershipQueryError
    );
  }

  if (existingMembership) {
    return { ...course, alreadyJoined: true } as JoinedCourse;
  }

  const { error: membershipError } = await supabase
    .from("course_membership")
    .insert([
      {
        profile_id: userId,
        course_id: course.id,
        is_tutor: isTutor,
      },
    ]);

  if (membershipError) {
    throw new Error(`Error joining course: ${membershipError.message}`);
  }

  return { ...course, alreadyJoined: false } as JoinedCourse;
};

// Retrieve the course details by its UUID.
export const getCourseInfo = async (
  supabase: SupabaseClient,
  courseId: string
): Promise<z.infer<typeof Course>> => {
  const { data, error } = await supabase
    .from("course")
    .select("*")
    .eq("id", courseId)
    .single();

  if (error || !data) {
    throw new Error(`Error fetching course info: ${error?.message}`);
  }

  return data as z.infer<typeof Course>;
};

// Deletes a course from user's course list by removing their membership.
export const deleteCourse = async (
  supabase: SupabaseClient,
  courseId: string,
  userId: string
): Promise<void> => {
  const { error } = await supabase
    .from("course_membership")
    .delete()
    .eq("profile_id", userId)
    .eq("course_id", courseId);

  if (error) {
    throw new Error(`Error deleting course: ${error.message}`);
  }
};

export async function toggleInstructorStatus(
  supabase: SupabaseClient,
  courseId: string,
  userId: string
): Promise<void> {
  const { data: membership, error: membershipError } = await supabase
    .from("course_membership")
    .select("is_tutor")
    .eq("profile_id", userId)
    .eq("course_id", courseId)
    .single();

  if (membershipError || !membership) {
    throw new Error(
      `Membership not found or error: ${membershipError?.message ?? ""}`
    );
  }

  const newIsTutorValue = !membership.is_tutor;

  const { error: updateError } = await supabase
    .from("course_membership")
    .update({ is_tutor: newIsTutorValue })
    .eq("profile_id", userId)
    .eq("course_id", courseId)
    .single();

  if (updateError) {
    throw new Error(`Error toggling instructor status: ${updateError.message}`);
  }
}

export const getCourseMembership = async (
  supabase: SupabaseClient,
  courseId: string,
  userId: string
): Promise<{ is_tutor: boolean }> => {
  const { data, error } = await supabase
    .from("course_membership")
    .select("is_tutor")
    .eq("profile_id", userId)
    .eq("course_id", courseId)
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Membership not found");
  }

  return data as { is_tutor: boolean };
};
