import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { getCourseInfo } from "@/utils/supabase/queries/course";
import { getStudyRooms } from "@/utils/supabase/queries/studyroom";
import { getResourceRepository } from "@/utils/supabase/queries/resource-repository";
import { getForumRepository } from "@/utils/supabase/queries/forum-repository";
import { getForumPost } from "@/utils/supabase/queries/forum-post";
import { getForumComments } from "@/utils/supabase/queries/forum-comment";
import { CourseLayout } from "@/components/course/courseLayout";
import { ForumRepositoryLayout } from "@/components/forum-repository/forumRepositoryLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { GetServerSidePropsContext } from "next";
import { createSupabaseServerClient } from "@/utils/supabase/clients/server-props";

type ForumPageProps = {
  user: User;
};

export default function ForumPage({ user }: ForumPageProps) {
  const router = useRouter();
  const { courseId, forumId } = router.query as {
    courseId: string;
    forumId: string;
  };
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

  const {
    data: post,
    isLoading: postLoading,
  } = useQuery({
    queryKey: ["forumPost", forumId],
    queryFn: () => getForumPost(supabase, forumId),
    enabled: !!forumId
  });
  const {
    data: comments,
    isLoading: commentsLoading,
  } = useQuery({
    queryKey: ["forumComments", forumId],
    queryFn: () => getForumComments(supabase, forumId),
    enabled: !!forumId
  });

  if (!course || !forumRepository) return <div>Loading…</div>;
  if (postLoading || commentsLoading) return <div>Loading forum…</div>;

  return (
    <CourseLayout
      user={user}
      course={course}
      studyRooms={studyRooms ?? []}
      resourceRepository={resourceRepository!}
      forumRepository={forumRepository!}
    >
      <ForumRepositoryLayout>
        <Card>
          <CardHeader>
            <CardTitle>{post!.title}</CardTitle>
          </CardHeader>
          <CardContent>{post!.content}</CardContent>
        </Card>

        <div className="space-y-4 mt-6">
          {comments!.map((c) => (
            <Card key={c.id}>
              <CardHeader>
                <CardTitle className="text-sm">By {c.author_id}</CardTitle>
              </CardHeader>
              <CardContent>{c.content}</CardContent>
            </Card>
          ))}
        </div>
      </ForumRepositoryLayout>
    </CourseLayout>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const supabase = createSupabaseServerClient(context);
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData) {
    return { redirect: { destination: "/login", permanent: false } };
  }

  return { props: {} };
}