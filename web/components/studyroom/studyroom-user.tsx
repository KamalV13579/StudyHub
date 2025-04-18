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
import { Crown } from "lucide-react";

type StudyRoomUserViewProps = {
  profile: z.infer<typeof Profile>;
  isAdmin?: boolean;
};
export default function StudyRoomUserView({
  profile,
  isAdmin = false,
}: StudyRoomUserViewProps) {
  return (
    <SidebarMenuButton asChild className="h-12 p-3">
      <div className="flex flex-row gap-3 p-2">
        <ProfileAvatar profile={profile} />
        <a className="font-semibold">{profile.name}</a>
        {isAdmin && <Crown className="ml-1 text-amber-400" />}
      </div>
    </SidebarMenuButton>
  );
}
