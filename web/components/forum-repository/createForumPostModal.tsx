import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { createForum } from "@/utils/supabase/queries/forum";
import { createForumPost } from "@/utils/supabase/queries/forum-post";
import { upsertForumMembership } from "@/utils/supabase/queries/forum-membership";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type CreateForumPostModalProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  user: User;
  repositoryId: string;
  courseId: string;
};

export function CreateForumPostModal({ open, setOpen, user, repositoryId, courseId }: CreateForumPostModalProps) {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error("Please provide both a title and content for the post.");
      return;
    }

    setSubmitting(true);
    let attachmentUrl: string | null = null;

    try {
      const forum = await createForum(supabase, courseId, repositoryId, title);

      if (attachment) {
        const fileExt = attachment.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `public/${forum.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('forum-attachments')
          .upload(filePath, attachment);

        if (uploadError) {
          throw new Error(`Failed to upload attachment: ${uploadError.message}`);
        }

        const { data: urlData } = supabase.storage
          .from('forum-attachments')
          .getPublicUrl(filePath);

        if (!urlData?.publicUrl) {
            console.warn("Could not get public URL for uploaded file, but upload succeeded.");
        } else {
             attachmentUrl = urlData.publicUrl;
        }
      }

      await createForumPost(supabase, forum.id, user.id, title, content, attachmentUrl);
      await upsertForumMembership(supabase, forum.id, user.id, isAnonymous);

      toast.success("Forum post created successfully!");
      setTitle("");
      setContent("");
      setIsAnonymous(false);
      setAttachment(null);
      const fileInput = document.getElementById('attachments-modal') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      await queryClient.invalidateQueries({ queryKey: ["forumPosts", repositoryId] });
      setOpen(false);
    } catch (err) {
      console.error("Error creating post:", err);
      toast.error(`Failed to create post: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Post</DialogTitle>
          <DialogDescription>
            Fill in the details for your new forum post. Click submit when you are done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="title-modal">Title</Label>
              <Input
                id="title-modal"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Post title"
                disabled={submitting}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="content-modal">Content</Label>
              <Textarea
                id="content-modal"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                placeholder="Write your content..."
                rows={5}
                disabled={submitting}
              />
            </div>
             <div className="flex items-center space-x-2">
              <Switch
                id="anonymous-switch-modal"
                checked={isAnonymous}
                onCheckedChange={setIsAnonymous}
                disabled={submitting}
              />
               <Label htmlFor="anonymous-switch-modal" className="cursor-pointer">
                Post Anonymously
              </Label>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="attachments-modal">
                Attachment <span className="text-xs text-muted-foreground">(Optional)</span>
              </Label>
              <Input
                id="attachments-modal"
                type="file"
                onChange={(e) => setAttachment(e.target.files ? e.target.files[0] : null)}
                disabled={submitting}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-secondary file:text-secondary-foreground hover:file:bg-secondary/80 cursor-pointer text-center"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || !title.trim() || !content.trim()}>
              {submitting ? "Posting…" : "Submit Post"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}