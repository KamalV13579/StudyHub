import { useRouter } from "next/router";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { NotebookPen } from "lucide-react";
import StudyRoomOptions from "@/components/studyroom/studyroom-options";
import { useQuery } from "@tanstack/react-query";
import { User } from "@supabase/supabase-js";
import { useSupabase } from "@/lib/supabase";

type StudyRoomSidebarItemProps = {
  studyRoom: {
    id: string;
    title: string;
    course_id: string;
    creator_id: string;
  };
  selectedStudyRoomId?: string;
  courseId: string;
  user: User;
};

export default function StudyRoomSidebarItem({
  studyRoom,
  courseId,
  user,
}: StudyRoomSidebarItemProps) {
  const router = useRouter();
  const [isHovering, setIsHovering] = useState(false);
  const supabase = useSupabase();

  // fetch membership info for the current study room and user.
  const { data: membership } = useQuery({
    queryKey: ["studyRoomMembership", studyRoom.id, user.id],
    queryFn: async () => {
      if (!user.id) return null;
      const { data, error } = await supabase
        .from("study_room_membership")
        .select("is_owner")
        .eq("study_room_id", studyRoom.id)
        .eq("profile_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Determine if current user is the owner.
  const isOwner = !!(membership && membership.is_owner);

  const { roomId: currentStudyRoomId } = router.query as { roomId?: string };

  return (
    <div
      className={cn(
        "flex flex-row items-center gap-2 px-2 text-base leading-tight whitespace-nowrap text-muted-foreground cursor-pointer select-none",
        currentStudyRoomId === studyRoom.id || isHovering
          ? "bg-sidebar-accent text-sidebar-accent-foreground rounded-lg"
          : ""
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div
        className="flex items-center gap-2 flex-grow"
        onClick={() => {
          router.push(`/course/${courseId}/studyroom/${studyRoom.id}`);
        }}
      >
        <NotebookPen className="h-4 w-4" />
        <div className="truncate w-[70px]">{studyRoom.title}</div>
      </div>
      <div className="ml-auto">
        <StudyRoomOptions
          studyRoom={studyRoom}
          hovering={isHovering}
          isOwner={isOwner}
          user={user}
        />
      </div>
    </div>
  );
}
