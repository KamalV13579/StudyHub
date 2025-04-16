import { useRouter } from "next/router";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { NotebookPen } from "lucide-react";
import StudyRoomOptions from "@/components/studyroom/studyroom-options";

type StudyRoomSidebarItemProps = {
  studyRoom: {
    id: string;
    title: string;
    course_id: string; 
  };
  selectedStudyRoomId?: string;
  courseId: string;
};

export default function StudyRoomSidebarItem({
  studyRoom,
  courseId,
}: StudyRoomSidebarItemProps) {
  const router = useRouter();
  const [isHovering, setIsHovering] = useState(false);

  // Get the current study room id from the route
  const currentStudyRoomId = router.query.roomId as string;
  return (
    <div
    className={cn(
        "flex flex-row items-center hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:rounded-lg gap-2 px-2 text-base leading-tight whitespace-nowrap text-muted-foreground cursor-pointer",
        currentStudyRoomId === studyRoom.id || isHovering
          ? "bg-sidebar-accent text-sidebar-accent-foreground rounded-lg"
          : ""
    )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div
        className="flex items-center gap-2 flex-grow"
        onClick={() =>  router.push(`/course/${courseId}/studyroom/${studyRoom.id}`)}
      >
        <NotebookPen className="h-4 w-4" />
        {studyRoom.title}
      </div>
      <div className="ml-auto">
        <StudyRoomOptions studyRoom={studyRoom} hovering={isHovering} />
      </div>
    </div>
  );
}
