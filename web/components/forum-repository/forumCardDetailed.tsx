import React, { useState } from "react";
import { SupabaseClient, User } from "@supabase/supabase-js";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ForumPost } from "@/utils/supabase/models/forum-post";
import { PostAuthorDisplay } from "@/components/forum-repository/postAuthorDisplay";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Paperclip, Trash } from "lucide-react";
import { useRouter } from "next/router";
import { deleteForum } from "@/utils/supabase/queries/forum";
import { getForumRepository } from "@/utils/supabase/queries/forum-repository";

type ForumCardDetailedProps = {
  post: ForumPost;
  supabase: SupabaseClient;
  user: User;
  courseId: string;
};

export function ForumCardDetailed({
  post,
  supabase,
  user,
  courseId,
}: ForumCardDetailedProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const isAuthor = user.id === post.author_id;
  const isDeleted = post.title === "DELETED" && post.content === "DELETED";

  const handleDelete = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const repo = await getForumRepository(supabase, courseId);
      router.push(`/course/${courseId}/forum-repository/${repo.id}`);

      await deleteForum(supabase, post.forum_id);

      toast.success("Post deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ["forumPosts", repo.id] });
    } catch (error) {
      console.error("Failed to delete post:", error);
      toast.error("Failed to delete post.");
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const handleAttachmentClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (post.attachment_url) {
      window.open(post.attachment_url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <Card className={`w-full p-6 relative ${isDeleted ? "opacity-50" : ""}`}>
        {!isDeleted && (
          <div className="absolute top-4 right-4 text-xs text-muted-foreground">
            <PostAuthorDisplay
              supabase={supabase}
              forumId={post.forum_id}
              authorId={post.author_id}
              createdAt={post.created_at}
            />
          </div>
        )}

        <div className="flex flex-col gap-2 mb-4">
          <CardHeader className="p-0">
            <CardTitle>{isDeleted ? "DELETED" : post.title}</CardTitle>
          </CardHeader>
          {!isDeleted && (
            <CardContent className="p-0">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap mt-2">
                {post.content}
              </p>
            </CardContent>
          )}
          {isDeleted && (
            <p className="text-sm text-muted-foreground mt-2">
              This post has been deleted.
            </p>
          )}
        </div>

        {!isDeleted && (
          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center gap-2">
              {post.attachment_url && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAttachmentClick}
                >
                  <Paperclip className="mr-2 h-4 w-4" />
                  View Attachment
                </Button>
              )}
            </div>

            {isAuthor && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                className="flex items-center gap-2"
              >
                <Trash className="h-4 w-4" />
                Delete
              </Button>
            )}
          </div>
        )}
      </Card>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently mark the post as
            deleted.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={confirmDelete}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
