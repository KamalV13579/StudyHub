import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ForumComment } from "@/utils/supabase/models/forum-comment";
import { SupabaseClient } from "@supabase/supabase-js";
import { CommentAuthorDisplay } from "@/components/forum-repository/commentAuthorDisplay";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteForumComment } from "@/utils/supabase/queries/forum-comment";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";


type CommentCardProps = {
  comment: ForumComment;
  supabase: SupabaseClient;
  forumId: string;
  originalPostAuthorId: string;
  userId: string; // Add userId to props
};

export function CommentCard({ comment, supabase, forumId, originalPostAuthorId, userId }: CommentCardProps) {
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const isAuthor = userId === comment.author_id;

  const handleDelete = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteForumComment(supabase, comment.id);
      toast.success("Comment deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ["forumComments", forumId] });
    } catch (error) {
      console.error("Failed to delete comment:", error);
      toast.error("Failed to delete comment.");
    } finally {
      setDeleteDialogOpen(false);
    }
  };


  return (
    <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <Card
        key={comment.id}
        className="bg-card relative"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {isAuthor && (
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "absolute top-1 right-1 h-6 w-6 text-muted-foreground hover:text-destructive",
                isHovering ? "visible" : "invisible"
              )}
              onClick={handleDelete}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTrigger>
        )}
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-normal text-muted-foreground">
            <CommentAuthorDisplay
              supabase={supabase}
              authorId={comment.author_id}
              forumId={forumId}
              createdAt={comment.created_at}
              originalPostAuthorId={originalPostAuthorId}
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap">{comment.content}</p>
        </CardContent>
      </Card>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the comment.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}