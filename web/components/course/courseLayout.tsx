import { ReactNode } from "react";
import { CourseSidebar } from "@/components/course/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { User } from "@supabase/supabase-js";
import { Course } from "@/utils/supabase/models/course";
import { StudyRoom } from "@/utils/supabase/models/studyroom";
import { ResourceRepository } from "@/utils/supabase/models/resource-repository";
import { ForumRepository } from "@/utils/supabase/models/forum-repository";

type CourseLayoutProps = {
  children: ReactNode;
  user: User;
  course: Course;
  studyRooms: StudyRoom[];
  resourceRepository: ResourceRepository;
  forumRepository: ForumRepository;
};

export function CourseLayout({
  children,
  user,
  course,
  studyRooms,
  resourceRepository,
  forumRepository,
}: CourseLayoutProps) {
  if (!course.id || typeof course.id !== "string") {
    return <div>Loading course...</div>;
  }

  return (
    <SidebarProvider
      style={{ "--sidebar-width": "240px" } as React.CSSProperties}
    >
      <div className="flex h-screen">
        <div className="flex-shrink-0 w-[240px] border-r">
          <CourseSidebar
            course={course}
            user={user}
            studyRooms={studyRooms}
            resourceRepository={resourceRepository}
            forumRepository={forumRepository}
          />
        </div>

        <main className="flex-1 p-4 overflow-y-auto">{children}</main>
      </div>
    </SidebarProvider>
  );
}
