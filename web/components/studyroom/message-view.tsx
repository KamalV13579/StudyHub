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
import { X } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { SupabaseClient, User } from "@supabase/supabase-js";
import { Profile } from "@/utils/supabase/models/profile";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { deleteMessage } from "@/utils/supabase/queries/message";
import { deleteMessageFromCacheFn } from "@/utils/supabase/cache/message-cache";

type MessageViewProps = {
  user: User;
  supabase: SupabaseClient;
  channelMembers: z.infer<typeof Profile>[];
  message: z.infer<typeof Message>;
  studyRoomId: string;
};
export default function MessageView({
  user,
  channelMembers,
  message,
  supabase,
  studyRoomId,
}: MessageViewProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      // Optimistically remove from cache
      deleteMessageFromCacheFn(queryClient, studyRoomId)(message.id);

      // Actually delete from database
      await deleteMessage(supabase, message.id);

      toast.success("Message deleted");
    } catch {
      // Revert by invalidating queries
      queryClient.invalidateQueries({ queryKey: ["messages", studyRoomId] });
      toast.error("Failed to delete message");
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  return (
    <div
      className="flex flex-row w-full gap-3 p-2 hover:bg-accent rounded-lg"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
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
          <div className="ml-auto flex flex-row items-center gap-2">
            {message.author.id === user.id && (
              <Dialog
                open={deleteDialogOpen}
                onOpenChange={(isOpen) => setDeleteDialogOpen(isOpen)}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className={cn(
                      "bg-accent border-sidebar hover:bg-background",
                      isHovering ? "visible" : "invisible"
                    )}
                  >
                    <X />
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-background rounded-lg border p-6 shadow-lg">
                  <DialogHeader className="space-y-4">
                    <DialogTitle className="text-lg font-semibold">
                      Delete Message
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                      Are you sure you want to delete this message?
                    </DialogDescription>
                  </DialogHeader>

                  {/* Message preview card */}
                  <div className="my-4 p-4 bg-muted/50 rounded-lg border">
                    <div className="flex items-center gap-3 mb-2">
                      <ProfileAvatar profile={message.author} />
                      <div>
                        <p className="font-medium">{message.author.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {message.created_at &&
                            new Date(message.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {message.attachment_url && (
                      <Image
                        src={message.attachment_url}
                        alt="Attachment"
                        width={200}
                        height={200}
                        className="rounded-md mb-2"
                      />
                    )}
                    <p className="text-sm">{message.content}</p>
                  </div>
                  <DialogFooter className="gap-2 sm:gap-0 space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setDeleteDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDelete}>
                      Delete
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
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
