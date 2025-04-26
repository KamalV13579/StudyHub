import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ForumComment } from "@/utils/supabase/models/forum-comment";
import { SupabaseClient } from "@supabase/supabase-js";
import { CommentAuthorDisplay } from "@/components/forum-repository/commentAuthorDisplay";

type CommentCardProps = {
  comment: ForumComment;
  supabase: SupabaseClient;
  forumId: string;
  originalPostAuthorId: string;
};

export function CommentCard({ comment, supabase, forumId, originalPostAuthorId }: CommentCardProps) {
  return (
    <Card key={comment.id} className="bg-card">
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
        <p>{comment.content}</p>
      </CardContent>
    </Card>
  );
}