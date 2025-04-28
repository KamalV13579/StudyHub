import React from "react";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { getCourseInfo } from "@/utils/supabase/queries/course";
import {
  getResourceRepository,
  getResourceDetail,
} from "@/utils/supabase/queries/resource-repository";
import { getStudyRooms } from "@/utils/supabase/queries/studyroom";
import { getForumRepository } from "@/utils/supabase/queries/forum-repository";
import { useSupabase } from "@/lib/supabase";
import { CourseSidebar } from "@/components/course/sidebar";
import { ResourceDetailCard } from "@/components/resource-repository/resourceDetailCard";
import { User } from "@supabase/supabase-js";
import { GetServerSidePropsContext } from "next";
import { createSupabaseServerClient } from "@/utils/supabase/clients/server-props";
import Link from "next/link";
import { Button } from "@/components/ui/button";
type Props = {
  user: User;
};

export default function ResourceDetailPage({ user }: Props) {
  const router = useRouter();
  const { courseId, resourceId } = router.query as {
    courseId: string;
    resourceId: string;
  };
  const supabase = useSupabase();

  const { repositoryId } = router.query;

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

  const { data: forumRepository } = useQuery({
    queryKey: ["forumRepository", courseId],
    queryFn: () => getForumRepository(supabase, courseId),
    enabled: !!courseId,
  });

  const { data: resourceRepository, isLoading: loadingRepo } = useQuery({
    queryKey: ["resourceRepository", courseId],
    queryFn: () => getResourceRepository(supabase, courseId),
    enabled: !!courseId,
  });

  const { data: resource, isLoading: loadingResource } = useQuery({
    queryKey: ["resourceDetail", resourceId],
    queryFn: () => getResourceDetail(supabase, resourceId),
    enabled: !!resourceId,
  });

  if (loadingCourse || loadingRepo || loadingResource) {
    return (
      <div className="flex items-center justify-center h-screen">Loading…</div>
    );
  }

  if (!course || !resourceRepository || !resource || !forumRepository) {
    return (
      <div className="flex items-center justify-center h-screen">
        Failed to load resource information.
      </div>
    );
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
        <div className="mx-auto py-8 px-4 flex flex-col gap-8">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="max-w-3xs inline-flex"
          >
            {/* Button will render this <Link> instead of a <button> */}
            <Link
              href={`/course/${courseId}/resource-repository/${repositoryId}`}
            >
              Back to Resources
            </Link>
          </Button>
          <ResourceDetailCard resource={resource} user={user} />
        </div>
      </main>
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const supabase = createSupabaseServerClient(context);
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData) {
    return {
      redirect: { destination: "/login", permanent: false },
    };
  }
  return {
    props: { user: userData.user },
  };
}
