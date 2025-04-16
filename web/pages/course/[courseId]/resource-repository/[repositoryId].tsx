import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { createSupabaseComponentClient } from "@/utils/supabase/clients/component";
import { getCourseInfo } from "@/utils/supabase/queries/course";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { CourseLayout } from "@/components/course/courseLayout";

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
    <>
      {user && (
        <CourseLayout>
          <div>
            <h1>
              Welcome to {course.course_code} - {course.course_name} Resource Repository!
            </h1>
          </div>
        </CourseLayout>
      )}
    </>
  );
}