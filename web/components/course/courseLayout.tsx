import { ReactNode } from "react";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { CourseSidebar } from "@/components/course/sidebar"; 
import { User } from "@supabase/supabase-js";

interface CourseLayoutProps {
  user: User; 
  children: ReactNode;
}

export function CourseLayout({ user, children }: CourseLayoutProps) {
  return (
    <div className="flex h-screen">
      <div className="w-[calc(var(--sidebar-width-icon)+1px)]">
        <AppSidebar user={user} />
      </div>
      <div className="w-[240px] border-r">
        <CourseSidebar />
      </div>
      <main className="flex-1 p-4 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}