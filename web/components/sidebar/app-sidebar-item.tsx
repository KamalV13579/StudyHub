import { Book } from "lucide-react";
import { cn } from "@/lib/utils";
import { Course } from "@/utils/supabase/models/course";
import { useRouter } from "next/router";
import { z } from "zod";
import { useState } from "react";
import CourseOptions from "./course-options";

type CourseSidebarItemProps = {
  course: z.infer<typeof Course>;
  selectedCourseId?: string;
};

export default function CourseSidebarItem({
  course,
  selectedCourseId,
}: CourseSidebarItemProps) {
  const router = useRouter();
  const [isHovering, setIsHovering] = useState<boolean>(false);

  return (
    <div
      className={cn(
        "flex flex-row items-center hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:rounded-lg gap-2 px-2 text-base leading-tight whitespace-nowrap text-muted-foreground",
        course.id === selectedCourseId || isHovering
          ? "bg-sidebar-accent text-sidebar-accent-foreground rounded-lg"
          : ""
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={() => router.push(`/course/${course.id}`)}
    >
      <Book className="size-4" /> {course.course_code}
      <div className="ml-auto">
        <CourseOptions
          course={course}
          hovering={isHovering}
        />
      </div>
    </div>
  );
}