/**
 * Shows a user in the server sidebar list.
 *
 * @author Ajay Gandecha <ajay@cs.unc.edu>
 * @author Jade Keegan <jade@cs.unc.edu>
 */

import { z } from "zod";
import ProfileAvatar from "../profile/profile-avatar";
import { SidebarMenuButton } from "../ui/sidebar";
import { Profile } from "@/utils/supabase/models/profile";
import { Crown, GraduationCap } from "lucide-react";

type StudyRoomUserViewProps = {
  profile: z.infer<typeof Profile>;
  isAdmin?: boolean;
  isTutor?: boolean;
};
export default function StudyRoomUserView({
  profile,
  isAdmin = false,
  isTutor = false,
}: StudyRoomUserViewProps) {
  return (
    <SidebarMenuButton asChild className="h-12 p-3">
      <div className="flex flex-row gap-3 p-2">
        <ProfileAvatar profile={profile} />
        <a className="font-semibold truncate flex-1 min-w-0 max-w-[70px]">
          {profile.name}
        </a>
        {isAdmin && (
          <span className="ml-1 shrink-0 p-1 rounded-full light:bg-gray-200">
            <Crown className="h-4 w-4 text-amber-400" />
          </span>
        )}
        {isTutor && (
          <span className="ml-1 shrink-0 p-1 rounded-full light:bg-gray-200">
            <GraduationCap className="h-4 w-4 text-emerald-400" />
          </span>
        )}

      </div>
    </SidebarMenuButton>
  );
}
