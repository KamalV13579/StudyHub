import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { getCourseInfo } from "@/utils/supabase/queries/course";
import { useSupabase } from "@/lib/supabase";
import { ResourceRepositoryLayout } from "@/components/resource-repository/resourceRepositoryLayout";
import { User } from "@supabase/supabase-js";
import { CourseLayout } from "@/components/course/courseLayout";

type ResourceRepositoryHomePageProps = {
  user: User;
};

export default function ResourceRepositoryHomePage({ user }: ResourceRepositoryHomePageProps) {
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
      <ResourceRepositoryLayout user = {user}>
        <div>
          <h1>
            Welcome to {course.course_code} - {course.course_name} Resource Repository!
          </h1>
        </div>
      </ResourceRepositoryLayout>
    </CourseLayout>
  );
}