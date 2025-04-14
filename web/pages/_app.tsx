import { ThemeProvider } from "@/components/theme/theme-provider";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { Toaster } from "sonner";
import { useEffect, useState } from "react";
import { createSupabaseComponentClient } from "@/utils/supabase/clients/component";
import { User } from "@supabase/supabase-js";

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const excludedRoutes = ["/login", "/signup"];
  const [user, setUser] = useState<User | null>(null);
  const supabase = createSupabaseComponentClient();

  useEffect(() => {
    async function fetchUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    }
    fetchUser();
  }, [supabase, router]);

  // If the route is excluded, render the page without sidebars.
  if (excludedRoutes.includes(router.pathname)) {
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Component {...pageProps} />
          <Toaster />
        </ThemeProvider>
      </QueryClientProvider>
    );
  }

  // Show a loading state until the user is loaded (though redirect should have happened if missing)
  if (!user) {
    return <div>Loading application…</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        <SidebarProvider style={{ "--sidebar-width": "240px" } as React.CSSProperties}>
          <AppSidebar user={user} />
          <SidebarInset>
            <Component {...pageProps} />
            <Toaster />
          </SidebarInset>
        </SidebarProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}