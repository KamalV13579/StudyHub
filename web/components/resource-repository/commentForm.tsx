import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createComment } from "@/utils/supabase/queries/resource-repository";
import { useSupabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useState } from "react";

type CommentFormProps = {
  resourceId: string;
  onSuccess: () => void;
};

export function CommentForm({ resourceId, onSuccess }: CommentFormProps) {
  const supabase = useSupabase();
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!newComment.trim()) {
      toast.error("Comment cannot be empty.");
      return;
    }

    try {
      setLoading(true);
      await createComment(supabase, resourceId, newComment);
      toast.success("Comment posted!");
      setNewComment("");
      onSuccess();
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to post comment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Textarea
        placeholder="What are your thoughts?"
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        disabled={loading}
      />
      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={loading || !newComment.trim()}>
          {loading ? "Posting..." : "Post Comment"}
        </Button>
      </div>
    </div>
  );
}
