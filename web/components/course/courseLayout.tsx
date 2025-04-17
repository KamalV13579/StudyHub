import { ReactNode } from "react";
import { CourseSidebar } from "@/components/course/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { User } from "@supabase/supabase-js";
import { Course } from "@/utils/supabase/models/course";

interface CourseLayoutProps {
  children: ReactNode;
  user: User;
  course: Course;
}

export function CourseLayout({ children, user, course }: CourseLayoutProps) {

  if (!course.id || typeof course.id !== "string") {
    return <div>Loading course...</div>;
  }

  return (
    <SidebarProvider style={{ "--sidebar-width": "240px" } as React.CSSProperties}>
      {/* Shift content to the right by the width of the global AppSidebar */}
      <div className="flex h-screen">
        <div className="flex-shrink-0 w-[240px] border-r">
          <CourseSidebar course={course} user={user} />
        </div>

        {/* Main Content */}
        <main className="flex-1 p-4 overflow-y-auto">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}

