import React from "react";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { getCourseInfo } from "@/utils/supabase/queries/course";
import { getStudyRooms } from "@/utils/supabase/queries/studyroom";
import { getResourceRepository } from "@/utils/supabase/queries/resource-repository";
import { getForumRepository } from "@/utils/supabase/queries/forum-repository";
import { getForumPostsByRepositoryId } from "@/utils/supabase/queries/forum-post";
import { ForumRepositoryLayout } from "@/components/forum-repository/forumRepositoryLayout";
import { GetServerSidePropsContext } from "next";
import { createSupabaseServerClient } from "@/utils/supabase/clients/server-props";
import { CourseSidebar } from "@/components/course/sidebar";

type ForumRepositoryHomePageProps = {
  user: User;
};

export default function ForumRepositoryHomePage({ user }: ForumRepositoryHomePageProps) {
  const router = useRouter();
  const courseId = router.query.courseId as string;
  const repositoryId = router.query.repositoryId as string;
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

  const { data: resourceRepository } = useQuery({
    queryKey: ["resourceRepository", courseId],
    queryFn: () => getResourceRepository(supabase, courseId),
    enabled: !!courseId,
  });

  const { data: forumRepository, isLoading: loadingForumRepo } = useQuery({
    queryKey: ["forumRepository", courseId],
    queryFn: () => getForumRepository(supabase, courseId),
    enabled: !!courseId,
  });

  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ["forumPosts", repositoryId],
    queryFn: () => getForumPostsByRepositoryId(supabase, repositoryId),
    enabled: !!repositoryId,
  });

  if (loadingCourse || loadingForumRepo) {
     return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!course || !forumRepository || !resourceRepository) {
     return <div className="flex justify-center items-center h-screen">Failed to load course information.</div>;
  }

  return (
    <div className="flex h-screen">
      <div className="w-60 h-full flex-shrink-0 border-r overflow-y-auto">
        <CourseSidebar
          user={user}
          course={course}
          studyRooms={studyRooms ?? []}
          resourceRepository={resourceRepository}
          forumRepository={forumRepository}
        />
      </div>
      <main className="flex-1 min-w-0 overflow-auto">
        <ForumRepositoryLayout
          posts={posts}
          isLoading={postsLoading}
          user={user}
          repositoryId={repositoryId}
          courseId={courseId}
        />
      </main>
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const supabase = createSupabaseServerClient(context);
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData?.user) {
    return { redirect: { destination: "/login", permanent: false } };
  }

  return { props: { user: userData.user } };
}