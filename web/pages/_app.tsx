import { ThemeProvider } from "@/components/theme/theme-provider";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { Toaster } from "sonner";
import { useEffect, useState } from "react";
import { useSupabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { Analytics } from '@vercel/analytics/next';
import Head from "next/head";


const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const excludedRoutes = ["/login", "/signup"];
  const [user, setUser] = useState<User | null>(null);
  const supabase = useSupabase();

  useEffect(() => {
    async function fetchUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    }
    fetchUser();
  }, [supabase, router]);

  if (excludedRoutes.includes(router.pathname)) {
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Component {...pageProps} user = {user} />
          <Toaster />
        </ThemeProvider>
      </QueryClientProvider>
    );
  }

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
        <SidebarProvider style={{ "--sidebar-width": "170px" } as React.CSSProperties}>
          <AppSidebar user={user} />
            <SidebarInset>
              <Component {...pageProps} user = {user} />
              <Toaster />
              <Analytics />
            </SidebarInset>
        </SidebarProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}