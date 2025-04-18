import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { getCourseInfo } from "@/utils/supabase/queries/course";
import { useSupabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { CourseLayout } from "@/components/course/courseLayout";
import { getStudyRooms } from "@/utils/supabase/queries/studyroom";
import { getResourceRepository } from "@/utils/supabase/queries/resource-repository";
import { getForumRepository } from "@/utils/supabase/queries/forum-repository";
import { GetServerSidePropsContext } from "next";
import { createSupabaseServerClient } from "@/utils/supabase/clients/server-props";
import { ForumRepositoryLayout } from "@/components/forum-repository/forumRepositoryLayout";

type ForumRepositoryHomePageProps = {
  user: User;
};

export default function ForumRepositoryHomePage({ user }: ForumRepositoryHomePageProps) {
  const router = useRouter();
  const courseId = router.query.courseId as string;
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

  if (!course) return <div>Loading course info...</div>;
  if (!forumRepository) return <div>Loading forum repository...</div>;

  return (
    <CourseLayout
      user={user}
      course={course}
      studyRooms={studyRooms ?? []}
      resourceRepository={resourceRepository!}
      forumRepository={forumRepository!}
    >
      <ForumRepositoryLayout>
        <h1>Welcome to {course.course_code} - {course.course_name} Forum Repository: {forumRepository.id}!</h1>
      </ForumRepositoryLayout>
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