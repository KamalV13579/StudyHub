import { useRouter } from "next/router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "@/lib/supabase";
import { User, SupabaseClient } from "@supabase/supabase-js";
import { getForumRepository } from "@/utils/supabase/queries/forum-repository";
import { getForumPost } from "@/utils/supabase/queries/forum-post";
import { getForumComments, createForumComment } from "@/utils/supabase/queries/forum-comment";
import { ForumCard } from "@/components/forum-repository/forumCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { GetServerSidePropsContext } from "next";
import { createSupabaseServerClient } from "@/utils/supabase/clients/server-props";
import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ForumComment } from "@/utils/supabase/models/forum-comment";
import { getOrUpsertForumMembershipAnonymousStatus } from "@/utils/supabase/queries/forum-membership";
import { Badge } from "@/components/ui/badge";

const CommentAuthorDisplay = ({ supabase, authorId, forumId, createdAt, originalPostAuthorId }: { supabase: SupabaseClient, authorId: string, forumId: string, createdAt: string, originalPostAuthorId: string }) => {
  const [displayName, setDisplayName] = useState<string>('Loading...');
  const [isLoading, setIsLoading] = useState(true);
  const isOriginalPoster = authorId === originalPostAuthorId;

  useEffect(() => {
    let isMounted = true;
    const fetchAuthorDetails = async () => {
      setIsLoading(true);
      try {
        const isAnonymous = await getOrUpsertForumMembershipAnonymousStatus(supabase, forumId, authorId);

        if (isMounted) {
          if (isAnonymous) {
            setDisplayName('Anonymous');
          } else {
            const { data: profile, error } = await supabase
              .from('profile')
              .select('name')
              .eq('id', authorId)
              .single();

            if (error || !profile) {
              console.error("Error fetching profile or profile not found:", error);
              setDisplayName('Unknown User');
            } else {
              setDisplayName(profile.name);
            }
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error in fetchAuthorDetails:", error);
          setDisplayName('Unknown User');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (authorId && forumId) {
        fetchAuthorDetails();
    } else {
        setDisplayName('Unknown User');
        setIsLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [supabase, authorId, forumId]);

  return (
    <>
      Posted by {isLoading ? 'Loading...' : displayName}
      {isOriginalPoster && !isLoading && <Badge variant="secondary" className="ml-2">OP</Badge>}
      {' '}on {new Date(createdAt).toLocaleString()}
    </>
  );
};


type ForumPageProps = {
  user: User;
};

export default function ForumPage({ user }: ForumPageProps) {
  const router = useRouter();
  const { courseId, forumId } = router.query as {
    courseId: string;
    forumId: string;
  };
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: forumRepository } = useQuery({
    queryKey: ["forumRepository", courseId],
    queryFn: () => getForumRepository(supabase, courseId),
    enabled: !!courseId,
  });

  const {
    data: post,
    isLoading: postLoading,
    error: postError,
  } = useQuery({
    queryKey: ["forumPost", forumId],
    queryFn: () => getForumPost(supabase, forumId),
    enabled: !!forumId
  });

  const {
    data: comments,
    isLoading: commentsLoading,
    error: commentsError,
  } = useQuery({
    queryKey: ["forumComments", forumId],
    queryFn: () => getForumComments(supabase, post!.id),
    enabled: !!post?.id
  });

  const handleCommentSubmit = async () => {
    if (!newComment.trim() || !forumId || !user?.id || !post?.id) return;

    setIsSubmitting(true);
    try {
      await createForumComment(supabase, {
        post_id: post.id,
        author_id: user.id,
        content: newComment,
      });
      toast.success("Comment added successfully.");
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: ["forumComments", forumId] });
    } catch (error) {
      console.error("Failed to add comment:", error);
      toast.error("Failed to add comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (postLoading || commentsLoading || !forumRepository) return <div className="flex justify-center items-center h-screen">Loading forum content…</div>;
  if (postError || !post) return <div className="flex justify-center items-center h-screen">Error loading post or post not found.</div>;
  if (commentsError) return <div className="flex justify-center items-center h-screen">Error loading comments.</div>;

  return (
    <div className="flex flex-col w-full px-6 m-2 max-w-4xl mx-auto">
        <ForumCard
            post={post}
            courseId={courseId}
            supabase={supabase}
            user={user}
            repositoryId={forumRepository.id}
        />
        <div className="mt-6 p-4 border rounded-lg bg-card">
            <Label htmlFor="comment-input" className="text-sm font-medium">Add a comment</Label>
            <Textarea
            id="comment-input"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="What are your thoughts?"
            className="mt-2 min-h-[80px]"
            disabled={isSubmitting}
            />
            <div className="mt-3 flex justify-end">
            <Button
                onClick={handleCommentSubmit}
                disabled={isSubmitting || !newComment.trim()}
            >
                {isSubmitting ? "Posting..." : "Comment"}
            </Button>
            </div>
        </div>

        <div className="space-y-4 mt-6">
            <h2 className="text-lg font-semibold">Comments ({comments?.length ?? 0})</h2>
            {comments && comments.length > 0 ? (
            comments.map((comment: ForumComment) => (
                <Card key={comment.id} className="bg-card">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-normal text-muted-foreground">
                    <CommentAuthorDisplay
                        supabase={supabase}
                        authorId={comment.author_id}
                        forumId={forumId}
                        createdAt={comment.created_at}
                        originalPostAuthorId={post.author_id}
                    />
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p>{comment.content}</p>
                </CardContent>
                </Card>
            ))
            ) : (
            <p className="text-muted-foreground">No comments yet. Be the first to share your thoughts!</p>
            )}
        </div>
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const supabase = createSupabaseServerClient(context);
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) return { redirect: { destination: '/login', permanent: false } };
  if (!user) return { redirect: { destination: '/login', permanent: false } };

  return { props: { user } };
}