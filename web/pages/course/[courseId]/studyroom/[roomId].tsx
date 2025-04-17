import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { GetServerSidePropsContext } from "next";
import { createSupabaseServerClient } from "@/utils/supabase/clients/server-props";
import { useSupabase } from "@/lib/supabase";

import { getCourseInfo } from "@/utils/supabase/queries/course";
import {
  getStudyRooms,
  getStudyRoom,
} from "@/utils/supabase/queries/studyroom";
import { getResourceRepository } from "@/utils/supabase/queries/resource-repository";
import { getForumRepository } from "@/utils/supabase/queries/forum-repository";

import { CourseLayout } from "@/components/course/courseLayout";
import { StudyRoomLayout } from "@/components/studyroom/studyRoomLayout";
import type { User } from "@supabase/supabase-js";

type StudyRoomPageProps = {
  user: User;
};

export default function StudyRoomPage({ user }: StudyRoomPageProps) {
  const router = useRouter();
  const courseId = router.query.courseId as string;
  const roomId = router.query.roomId as string;
  const supabase = useSupabase();

  const { data: course } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => getCourseInfo(supabase, courseId),
    enabled: !!courseId,
  });

  const { data: studyRooms } = useQuery({
    queryKey: ["studyRooms", courseId],
    queryFn: () => getStudyRooms(supabase, courseId, user.id),
    enabled: !!courseId,
  });

  const { data: resourceRepository } = useQuery({
    queryKey: ["resourceRepository", courseId],
    queryFn: () => getResourceRepository(supabase, courseId),
    enabled: !!courseId,
  });

  const { data: forumRepository } = useQuery({
    queryKey: ["forumRepository", courseId],
    queryFn: () => getForumRepository(supabase, courseId),
    enabled: !!courseId,
  });

  const { data: studyRoom } = useQuery({
    queryKey: ["studyRoom", roomId],
    queryFn: async () => getStudyRoom(supabase, roomId),
    enabled: !!roomId,
  });

  if (!course) return <div>Loading course info...</div>;

  return (
    <CourseLayout
      user={user}
      course={course}
      studyRooms={studyRooms ?? []}
      resourceRepository={resourceRepository!}
      forumRepository={forumRepository!}
    >
      <StudyRoomLayout >
        <h1>Welcome to {studyRoom?.title}!</h1>
      </StudyRoomLayout>
    </CourseLayout>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const supabase = createSupabaseServerClient(context);

  const { data: userData, error: userError } = await supabase.auth.getUser();

  // If the user is not logged in, redirect them to the login page.
  if (userError || !userData) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}