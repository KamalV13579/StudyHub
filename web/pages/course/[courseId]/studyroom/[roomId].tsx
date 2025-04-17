import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { getCourseInfo } from "@/utils/supabase/queries/course";
import { User } from "@supabase/supabase-js";
import { getStudyRoom } from "@/utils/supabase/queries/studyroom";
import { StudyRoomLayout } from "@/components/studyroom/studyRoomLayout";
import { useSupabase } from "@/lib/supabase";
import { CourseLayout } from "@/components/course/courseLayout";

type StudyRoomPageProps = {
  user: User;
};

export default function StudyRoomPage({ user }: StudyRoomPageProps) {
  const router = useRouter();
  const { courseId } = router.query;
  const supabase = useSupabase();

  const { data: course, error } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => {
      if (!courseId) return Promise.resolve(null);
      return getCourseInfo(supabase, courseId as string);
    },
    enabled: !!courseId,
  });

  const { data: studyRoom, isLoading: studyRoomLoading } = useQuery({
    queryKey: ["study_room", router.query.roomId],
    queryFn: async () => {
      if (!router.query.roomId) return null;
      return getStudyRoom(supabase, router.query.roomId as string);
    },
    enabled: !!router.query.roomId,
  });

  if (studyRoomLoading) return <div>Loading study room info...</div>;
  if (error || !course) return <div>Error loading study room</div>;

  return (
    <>
      {user && (
        <CourseLayout user = {user} course = {course} >
          <StudyRoomLayout user = {user} >
            <div>
              <h1>
                Welcome to {studyRoom?.title}!
              </h1>
            </div>
          </StudyRoomLayout>
        </CourseLayout>
      )}
    </>
  );
}