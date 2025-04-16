import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { createSupabaseComponentClient } from "@/utils/supabase/clients/component";
import { getCourseInfo } from "@/utils/supabase/queries/course";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { CourseLayout } from "@/components/course/courseLayout";
import { getStudyRoom } from "@/utils/supabase/queries/studyroom";

export default function CourseHomePage() {
  const router = useRouter();
  const { courseId } = router.query;
  const supabase = createSupabaseComponentClient();

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function fetchUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    }
    fetchUser();
  }, [supabase, router]);

  const { data: course, error } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => {
      console.log("courseId", courseId);
      if (!courseId) return Promise.resolve(null);
      return getCourseInfo(supabase, courseId as string);
    },
    enabled: !!courseId,
  });

  const { data: studyRoom, isLoading: studyRoomLoading } = useQuery({
    queryKey: ["study_room", router.query.roomId],
    queryFn: async () => {
      console.log("roomId", router.query.roomId);
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
        <CourseLayout>
          <div>
            <h1>
              Welcome to {studyRoom?.title}!
            </h1>
          </div>
        </CourseLayout>
      )}
    </>
  );
}