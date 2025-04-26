import React, { useState } from "react";
import { SupabaseClient, User } from "@supabase/supabase-js";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ForumPost } from "@/utils/supabase/models/forum-post";
import { PostAuthorDisplay } from "@/components/forum-repository/postAuthorDisplay";
import { deleteForumPost } from "@/utils/supabase/queries/forum-post";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Paperclip } from "lucide-react";
import { useRouter } from "next/router";

type ForumCardDetailedProps = {
  post: ForumPost;
  supabase: SupabaseClient;
  user: User;
  courseId: string;
};

export function ForumCardDetailed({ post, supabase, user, courseId }: ForumCardDetailedProps) {
  const queryClient = useQueryClient();
  const router = useRouter(); // Initialize router
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const isAuthor = user.id === post.author_id;
  const isDeleted = post.title === "DELETED" && post.content === "DELETED";

  const handleDelete = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteForumPost(supabase, post.id);
      toast.success("Post deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ["forumPost", post.forum_id] });
      router.push(`/course/${courseId}/forum-repository`);
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
      <Card className={`relative ${isDeleted ? "opacity-50" : ""}`}>
        {isAuthor && !isDeleted && (
          <DialogTrigger asChild>
            <Button variant="destructive" size="sm" className="absolute top-2 right-2 z-10" onClick={handleDelete}>
              Delete
            </Button>
          </DialogTrigger>
        )}
        <CardHeader>
          <CardTitle>{isDeleted ? "DELETED" : post.title}</CardTitle>
          <CardDescription>
            {isDeleted ? (
              "This post has been deleted."
            ) : (
              <PostAuthorDisplay
                supabase={supabase}
                forumId={post.forum_id}
                authorId={post.author_id}
                createdAt={post.created_at}
              />
            )}
          </CardDescription>
        </CardHeader>
        {!isDeleted && (
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{post.content}</p>
            {post.attachment_url && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={handleAttachmentClick}
              >
                <Paperclip className="mr-2 h-4 w-4" />
                View Attachment
              </Button>
            )}
          </CardContent>
        )}
      </Card>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently mark the post as deleted.
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
