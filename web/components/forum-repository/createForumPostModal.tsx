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
  const [attachments, setAttachments] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error("Please provide both a title and content for the post.");
      return;
    }

    setSubmitting(true);

    try {
      const forum = await createForum(supabase, courseId, repositoryId, title);
      await createForumPost(supabase, forum.id, user.id, title, content, null);
      await upsertForumMembership(supabase, forum.id, user.id, isAnonymous);
      toast.success("Forum post created successfully!");
      setTitle("");
      setContent("");
      setIsAnonymous(false);
      setAttachments(null);
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Post</DialogTitle>
          <DialogDescription>
            Fill in the details for your new forum post. Click submit when you are done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title-modal" className="text-right">
                Title
              </Label>
              <Input
                id="title-modal"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="col-span-3"
                required
                placeholder="Post title"
                disabled={submitting}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="content-modal" className="text-right">
                Content
              </Label>
              <Textarea
                id="content-modal"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="col-span-3"
                required
                placeholder="Write your content..."
                rows={4}
                disabled={submitting}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="anonymous-switch-modal" className="text-right">
                Post Anonymously
              </Label>
              <Switch
                id="anonymous-switch-modal"
                checked={isAnonymous}
                onCheckedChange={setIsAnonymous}
                disabled={submitting}
                className="col-span-3 justify-self-start"
              />
            </div>
            <div className="flex flex-col gap-2 sm:grid sm:grid-cols-4 sm:items-center sm:gap-4">
              <Label htmlFor="attachments-modal" className="sm:text-right">
                Attachment
                <span className="text-xs text-muted-foreground ml-1">(Optional)</span>
              </Label>
              <Input
                id="attachments-modal"
                type="file"
                onChange={(e) => setAttachments(e.target.files ? e.target.files[0] : null)}
                className="sm:col-span-3"
                disabled={submitting}
              />
            </div>
          </div>
          <DialogFooter>
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