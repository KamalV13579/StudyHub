import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { createSupabaseComponentClient } from "@/utils/supabase/clients/component";
import { getCourseInfo } from "@/utils/supabase/queries/course";

export default function CourseHomePage() {
  const router = useRouter();
  const { courseId } = router.query;
  const supabase = createSupabaseComponentClient();

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
    <div>
      <h1>
        Welcome to {course.course_code} - {course.course_name}
      </h1>
    </div>
  );
}