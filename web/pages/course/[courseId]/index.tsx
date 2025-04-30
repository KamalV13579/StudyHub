import { useRouter } from "next/router";
import Link from "next/link";
import { GetServerSidePropsContext } from "next";
import { useQuery } from "@tanstack/react-query";
import { createSupabaseServerClient } from "@/utils/supabase/clients/server-props";
import { useSupabase } from "@/lib/supabase";
import { toast } from "sonner";

import { getCourseInfo } from "@/utils/supabase/queries/course";
import { getStudyRooms } from "@/utils/supabase/queries/studyroom";
import { getResourceRepository } from "@/utils/supabase/queries/resource-repository";
import { getForumRepository } from "@/utils/supabase/queries/forum-repository";
import { CourseSidebar } from "@/components/course/sidebar";

import type { User } from "@supabase/supabase-js";

type PageProps = {
  user: User;
};

export default function CourseHomePage({ user }: PageProps) {
  const router = useRouter();
  const courseId = router.query.courseId as string;
  const supabase = useSupabase();

  const { data: course, isLoading: loadingCourse } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => getCourseInfo(supabase, courseId),
    enabled: !!courseId,
  });

  const { data: studyRooms = [] } = useQuery({
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

  if (loadingCourse || !course || !resourceRepository || !forumRepository) {
    return <div>Loading...</div>;
  }

  const handleStudyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (studyRooms.length > 0) {
      router.push(`/course/${courseId}/studyroom/${studyRooms[0].id}`);
    } else {
      toast.error(
        "No study rooms joined yet. Create one or copy a code from a classmate!",
      );
    }
  };
  return (
    <div className="flex h-screen">
      <div className="ml-[70px] h-full flex-shrink-0 border-r dark:border-gray-700 overflow-y-auto">
        <CourseSidebar
          user={user}
          course={course}
          studyRooms={studyRooms ?? []}
          resourceRepository={resourceRepository}
          forumRepository={forumRepository}
        />
      </div>

      <div className="flex w-full h-screen flex-col items-center">
        {/* Header */}
        <header className="flex items-center max-w-5xl shadow-sm px-8 py-6 rounded">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {course.course_code}: {course.course_name}
          </h1>
        </header>

        {/* Main content */}
        <main className="flex-grow w-full max-w-5xl px-8 py-6 space-y-8">
          {/* Quick Links */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <button
              onClick={handleStudyClick}
              className="cursor-pointer shadow border rounded-lg p-6 transition h-full flex flex-col justify-between hover:bg-blue-50 dark:hover:bg-gray-800 hover:shadow-md"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Study Rooms
              </h2>
              <p className="mt-4 text-gray-600 dark:text-gray-300">
                {studyRooms.length} Room{studyRooms.length !== 1 && "s"}
              </p>
            </button>

            <Link
              href={`/course/${courseId}/resource-repository/${resourceRepository.id}`}
              className="shadow border rounded-lg p-6 transition h-full flex flex-col justify-between hover:bg-blue-50 dark:hover:bg-gray-800 hover:shadow-md"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Resources
              </h2>
              <p className="mt-4 text-gray-600 dark:text-gray-300">
                View Resources
              </p>
            </Link>

            <Link
              href={`/course/${courseId}/forum-repository/${forumRepository.id}`}
              className="shadow border rounded-lg p-6 transition h-full flex flex-col justify-between hover:bg-blue-50 dark:hover:bg-gray-800 hover:shadow-md"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Forums
              </h2>
              <p className="mt-4 text-gray-600 dark:text-gray-300">
                View Forums
              </p>
            </Link>
          </div>

          {/* Announcements */}
          <section className="shadow border rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Announcements
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              No announcements yet.
            </p>
          </section>
        </main>
      </div>
    </div>
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
