/* eslint-disable @next/next/no-img-element */
/**
 * Abstraction wrapper around Shadcn's avatar component to handle the properties
 * of the profile avatar for this app.
 * Used a07 Alias for reference
 */

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
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
        <img
          src="https://kzyyqceiufmftdesrefz.supabase.co/storage/v1/object/public/public-images//logo.png"
          alt="Logo"
        />
      </AvatarFallback>
    </Avatar>
  );
}
