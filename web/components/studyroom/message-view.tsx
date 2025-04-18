/**
 * View that represents an individual message.
 *
 * @author Ajay Gandecha <ajay@cs.unc.edu>
 * @author Jade Keegan <jade@cs.unc.edu>
 */

import { Message } from "@/utils/supabase/models/message";
import ProfileAvatar from "../profile/profile-avatar";
import ProfilePopover from "../profile/profile-popover";
import { z } from "zod";
import Image from "next/image";
import { User } from "@supabase/supabase-js";
import { Profile } from "@/utils/supabase/models/profile";

type MessageViewProps = {
  user: User;
  channelMembers: z.infer<typeof Profile>[];
  message: z.infer<typeof Message>;
};
export default function MessageView({
  channelMembers,
  message,
}: MessageViewProps) {
  return (
    <div className="flex flex-row w-full gap-3 p-2 hover:bg-accent rounded-lg">
      <ProfileAvatar
        profile={channelMembers.find((m) => m.id === message.author.id)}
      />
      <div className="flex flex-col grow gap-1">
        <div className="flex flex-row items-center gap-2">
          <ProfilePopover profile={message.author} side="top" align="start">
            <p className="font-semibold hover:underline">
              {message.author.name}
            </p>
          </ProfilePopover>
          <p className="text-sm text-muted-foreground">
            {message.created_at &&
              new Date(message.created_at).toLocaleString("en-US", {
                month: "numeric",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "numeric",
                hour12: true,
              })}
          </p>
        </div>
        {message.attachment_url && (
          <Image
            className="rounded-lg my-1"
            src={message.attachment_url}
            alt={message.content}
            width={300}
            height={300}
          />
        )}
        <p>{message.content}</p>
      </div>
    </div>
  );
}
