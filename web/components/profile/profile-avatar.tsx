/* eslint-disable @next/next/no-img-element */
/**
 * Abstraction wrapper around Shadcn's avatar component to handle the properties
 * of the profile avatar for this app.
 *
 * @author Ajay Gandecha <ajay@cs.unc.edu>
 * @author Jade Keegan <jade@cs.unc.edu>
 *
 * @see https://ui.shadcn.com/docs/components/avatar
 */

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { BotMessageSquare } from "lucide-react";
import { z } from "zod";
import { Profile } from "@/utils/supabase/models/profile";

type ProfileAvatarProps = {
  profile?: z.infer<typeof Profile>;
} & React.ComponentProps<typeof Avatar>;
export default function ProfileAvatar({
  profile,
  ...props
}: ProfileAvatarProps) {
  return (
    <Avatar {...props}>
      <AvatarImage src={profile?.avatar_url ?? ""} alt={profile?.handle} />
      <AvatarFallback>
        {/* CHANGE TO SOMETHING ELSE AS NEEDED */}
        <BotMessageSquare className="size-4" />
      </AvatarFallback>
    </Avatar>
  );
}
