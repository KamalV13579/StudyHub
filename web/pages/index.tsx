import { createSupabaseComponentClient } from "@/utils/supabase/clients/component";
import { createSupabaseServerClient } from "@/utils/supabase/clients/server-props";
import { getCourses } from "@/utils/supabase/queries/course";
import { useQuery } from "@tanstack/react-query";
import { ArrowBigLeftDash } from "lucide-react";
import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Home() {
  const supabase = createSupabaseComponentClient();
  const router = useRouter();
  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: () => getCourses(supabase),
  });

  useEffect(() => {
    if (courses && courses[0]) {
      router.push(`/course/${courses[0].id}`);

    }
  }, [router, courses]);

  if (coursesLoading) {
    <div>
      <p className="font-bold text-lg p-6">Loading...</p>
    </div>;
  }

  return (
    <div>
      <p className="font-bold text-lg p-6">Welcome!</p>
      <div className="flex flex-row gap-3 px-6 pt-4.5">
        <ArrowBigLeftDash />
        <p className="font-bold">
          Join a course on the sidebar here.
        </p>
      </div>
    </div>
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
    props: {}
  };
}