/**
 * Sidebar that is used on the right-hand side of servers to show the users
 * in the server that are online and offline.
 *
 * @author Ajay Gandecha <ajay@cs.unc.edu>
 * @author Jade Keegan <jade@cs.unc.edu>
 */

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import StudyRoomUserView from "./studyroom-user";
import ProfilePopover from "../profile/profile-popover";
import { ScrollArea } from "../ui/scroll-area";
import { z } from "zod";
import { Profile } from "@/utils/supabase/models/profile";
import { StudyRoom } from "@/utils/supabase/models/studyroom";
import { SupabaseClient } from "@supabase/supabase-js";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

type StudyRoomUserSidebarProps = {
  studyRoom?: z.infer<typeof StudyRoom>;
  studyRoomMembers: z.infer<typeof Profile>[];
  onlineUserIds: string[];
  userId: string;
  courseId: string; // Add courseId to props
  supabase: SupabaseClient; // Add supabase client to props
} & React.ComponentProps<typeof Sidebar>;

export function StudyRoomUserSidebar({
  studyRoom,
  studyRoomMembers,
  onlineUserIds,
  userId,
  courseId,
  supabase,
  ...props
}: StudyRoomUserSidebarProps) {
  const { data: courseMembers } = useQuery({
    queryKey: ["courseMembers", courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("course_membership")
        .select("profile_id, is_tutor")
        .eq("course_id", courseId);

      if (error) throw error;
      return data;
    },
  });

  // Create a map for quick tutor status lookup
  const tutorStatusMap = useMemo(() => {
    const map = new Map<string, boolean>();
    courseMembers?.forEach((member) => {
      map.set(member.profile_id, member.is_tutor);
    });
    return map;
  }, [courseMembers]);

  const isTutor = (userId: string) => tutorStatusMap.get(userId) || false;

  const onlineUsers = studyRoomMembers.filter(
    (member) => userId === member.id || onlineUserIds.includes(member.id),
  );

  const offlineUsers = studyRoomMembers.filter(
    (member) => !(userId === member.id) && !onlineUserIds.includes(member.id),
  );

  return (
    <Sidebar
      side="right"
      collapsible="none"
      className="min-w-[240px] max-w-[300px]"
      {...props}
    >
      <ScrollArea className="h-[calc(100vh-56px)] min-w-[240px] max-w-[240px]">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="font-semibold">
              ONLINE - {onlineUsers.length}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {onlineUsers.map((user) => (
                  <SidebarMenuItem key={user.id}>
                    <ProfilePopover
                      profile={user}
                      className="w-full"
                      side="left"
                      align="start"
                      triggerFullWidth
                    >
                      <StudyRoomUserView
                        profile={user}
                        isAdmin={studyRoom?.creator_id === user.id}
                        isTutor={isTutor(user.id)}
                      />
                    </ProfilePopover>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup className="text-muted-foreground">
            <SidebarGroupLabel className="font-semibold">
              OFFLINE - {offlineUsers.length}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {offlineUsers.map((user) => (
                  <SidebarMenuItem key={user.id}>
                    <ProfilePopover
                      profile={user}
                      className="w-full"
                      side="left"
                      align="start"
                      triggerFullWidth
                    >
                      <StudyRoomUserView
                        profile={user}
                        isAdmin={studyRoom?.creator_id === user.id}
                      />
                    </ProfilePopover>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </ScrollArea>
    </Sidebar>
  );
}
