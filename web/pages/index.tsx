import { createSupabaseComponentClient } from "@/utils/supabase/clients/component";
import { createSupabaseServerClient } from "@/utils/supabase/clients/server-props";
import { useQuery } from "@tanstack/react-query";
import { ArrowBigLeftDash } from "lucide-react";
import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Home() {
  // Hook into used depdencies.
  const supabase = createSupabaseComponentClient();
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold">Welcome to the Home Page</h1>
      <p className="mt-4 text-lg">You are logged in!</p>
      <button
        className="mt-8 px-4 py-2 bg-blue-500 text-white rounded"
        onClick={async () => {
          await supabase.auth.signOut();
          router.push("/login");
        }}
      >
        Sign Out
      </button>
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  // Create the supabase context that works specifically on the server and
  // pass in the context.
  const supabase = createSupabaseServerClient(context);

  // Attempt to load the user data
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
    props: {},
  };
}