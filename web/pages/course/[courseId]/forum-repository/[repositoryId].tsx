import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { getCourseInfo } from "@/utils/supabase/queries/course";
import { useSupabase } from "@/lib/supabase";
import { ForumRepositoryLayout } from "@/components/forum-repository/forumRepositoryLayout";
import { User } from "@supabase/supabase-js";
import { CourseLayout } from "@/components/course/courseLayout";

type ForumRepositoryHomePageProps = {
  user: User;
};

export default function ForumRepositoryHomePage({ user }: ForumRepositoryHomePageProps) {
  const router = useRouter();
  const { courseId } = router.query;
  const supabase = useSupabase();

  const { data: course, isLoading, error } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => {
      if (!courseId) return Promise.resolve(null);
      return getCourseInfo(supabase, courseId as string);
    },
    enabled: !!courseId,
  });

  if (isLoading) return <div>Loading course info...</div>;
  if (error || !course) return <div>Error loading course</div>;

  return (
    <CourseLayout user = {user} course = {course} >
      <ForumRepositoryLayout user = {user}>
        <div>
          <h1>
            Welcome to the {course.course_code} - {course.course_name} Forums!
          </h1>
        </div>
      </ForumRepositoryLayout>
    </CourseLayout>
  );
}