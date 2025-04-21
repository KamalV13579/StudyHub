/**
 * Popover that displays profile information. The trigger for the popover
 * is passed into this component as children. For example:
 *
 * ```tsx
 * <ProfilePopover>
 *   <p>Item to open the popover</p>
 * </ProfilePopover>
 * ```
 *
 * @author Ajay Gandecha <ajay@cs.unc.edu>
 * @author Jade Keegan <jade@cs.unc.edu>
 */

import { z } from "zod";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import ProfileAvatar from "./profile-avatar";
import { Profile } from "@/utils/supabase/models/profile";

type ProfilePopoverProps = {
  profile?: z.infer<typeof Profile>;
  side?: "top" | "right" | "bottom" | "left" | undefined;
  align?: "start" | "center" | "end" | undefined;
  triggerFullWidth?: boolean;
  children: React.ReactNode;
};

export default function ProfilePopover({
  profile,
  side,
  align,
  triggerFullWidth,
  children,
  ...props
}: ProfilePopoverProps & React.HTMLProps<typeof HTMLDivElement>) {
  console.log("ProfilePopover", profile);
  return (
    <Popover {...props}>
      <PopoverTrigger className={triggerFullWidth ? `w-full` : ""}>
        {children}
      </PopoverTrigger>
      <PopoverContent
        className="bg-sidebar"
        side={side}
        sideOffset={12}
        align={align}
      >
        <div className="flex flex-col w-full">
          <ProfileAvatar profile={profile} />
          <div className="flex flex-col w-full mt-4">
            <p className="font-bold text-lg truncate max-w-[100px]">
              {profile?.name}
            </p>
            <p className="text-muted-foreground">@{profile?.handle}</p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
