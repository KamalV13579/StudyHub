import { ReactNode } from "react";
import { useRouter } from "next/router";
import { CourseSidebar } from "@/components/course/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

interface CourseLayoutProps {
  children: ReactNode;
}

export function CourseLayout({ children }: CourseLayoutProps) {
  const router = useRouter();
  const { courseId } = router.query;

  if (!courseId || typeof courseId !== "string") {
    return <div>Loading course...</div>;
  }

  return (
    <SidebarProvider style={{ "--sidebar-width": "240px" } as React.CSSProperties}>
      {/* Shift content to the right by the width of the global AppSidebar */}
      <div className="flex h-screen">
        <div className="flex-shrink-0 w-[240px] border-r">
          <CourseSidebar courseId={courseId} />
        </div>

        {/* Main Content */}
        <main className="flex-1 p-4 overflow-y-auto">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}

