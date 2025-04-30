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
import { Analytics } from "@vercel/analytics/next";

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const excludedRoutes = ["/login", "/signup"];
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = useSupabase();

  useEffect(() => {
    async function fetchUser() {
      try {
        const { data } = await supabase.auth.getUser();
        setUser(data.user);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchUser();
  }, [supabase, router]);

  if (isLoading && !excludedRoutes.includes(router.pathname)) {
    return (
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
        themes={["light", "dark"]}
      >
        <div className="flex h-screen items-center justify-center">
          <div className="text-foreground">Loading application…</div>
        </div>
      </ThemeProvider>
    );
  }

  if (excludedRoutes.includes(router.pathname)) {
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          themes={["light", "dark"]}
        >
          <Component {...pageProps} user={user} />
          <Toaster />
        </ThemeProvider>
      </QueryClientProvider>
    );
  }

  if (!user) {
    return (
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
        themes={["light", "dark"]}
      >
        <div className="flex h-screen items-center justify-center">
          <div className="text-foreground">Please log in to continue</div>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
        themes={["light", "dark"]}
      >
        <SidebarProvider
          style={{ "--sidebar-width": "170px" } as React.CSSProperties}
        >
          <AppSidebar user={user} />
          <SidebarInset>
            <Component {...pageProps} user={user} />
            <Toaster />
            <Analytics />
          </SidebarInset>
        </SidebarProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
