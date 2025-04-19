import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { getCourseInfo } from "@/utils/supabase/queries/course";
import { getResourceRepository, getResourcesForRepository } from "@/utils/supabase/queries/resource-repository";
import { getStudyRooms } from "@/utils/supabase/queries/studyroom";
import { getForumRepository } from "@/utils/supabase/queries/forum-repository";
import { useSupabase } from "@/lib/supabase";
import { CourseLayout } from "@/components/course/courseLayout";
import { ResourceRepositoryLayout } from "@/components/resource-repository/resourceRepositoryLayout";
import { User } from "@supabase/supabase-js";
import { GetServerSidePropsContext } from "next";
import { createSupabaseServerClient } from "@/utils/supabase/clients/server-props";

type ResourceRepositoryHomePageProps = {
  user: User;
};

export default function ResourceRepositoryHomePage({ user }: ResourceRepositoryHomePageProps) {
  const router = useRouter();
  const courseId = router.query.courseId as string;
  const supabase = useSupabase();

  const { data: course, isLoading: loadingCourse } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => getCourseInfo(supabase, courseId),
    enabled: !!courseId,
  });

  const { data: studyRooms } = useQuery({
    queryKey: ["studyRooms", courseId],
    queryFn: () => getStudyRooms(supabase, courseId, user.id),
    enabled: !!courseId,
  });

  const { data: resourceRepository, isLoading: loadingRepository } = useQuery({
    queryKey: ["resourceRepository", courseId],
    queryFn: () => getResourceRepository(supabase, courseId), // based on courseId!
    enabled: !!courseId,
  });

  const { data: forumRepository } = useQuery({
    queryKey: ["forumRepository", courseId],
    queryFn: () => getForumRepository(supabase, courseId),
    enabled: !!courseId,
  });

  const { data: resources, isLoading: loadingResources } = useQuery({
    queryKey: ["resources", resourceRepository?.id],
    queryFn: () => getResourcesForRepository(supabase, resourceRepository!.id),
    enabled: !!resourceRepository?.id,
  });

  if (loadingCourse || loadingRepository) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!course || !resourceRepository) {
    return <div className="flex justify-center items-center h-screen">Failed to load course information.</div>;
  }

  return (
    <CourseLayout
    user={user}
    course={course}
    studyRooms={studyRooms ?? []}
    resourceRepository={resourceRepository}
    forumRepository={forumRepository!}
  >
<ResourceRepositoryLayout
  resources={resources ?? []}
  user={user}
  repositoryId={resourceRepository.id}
/>    </CourseLayout>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const supabase = createSupabaseServerClient(context);

  const { data: userData, error: userError } = await supabase.auth.getUser();

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
