import { useRouter } from "next/router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { getForumRepository } from "@/utils/supabase/queries/forum-repository";
import { getForumPost } from "@/utils/supabase/queries/forum-post";
import { getForumComments, createForumComment } from "@/utils/supabase/queries/forum-comment";
import { ForumCardDetailed } from "@/components/forum-repository/forumCardDetailed";
import { GetServerSidePropsContext } from "next";
import { createSupabaseServerClient } from "@/utils/supabase/clients/server-props";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ForumComment } from "@/utils/supabase/models/forum-comment";
import { CommentCard } from "@/components/forum-repository/commentCard";
import { getCourseInfo } from "@/utils/supabase/queries/course";
import { getStudyRooms } from "@/utils/supabase/queries/studyroom";
import { getResourceRepository } from "@/utils/supabase/queries/resource-repository";
import { CourseSidebar } from "@/components/course/sidebar";

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

  const { data: course, isLoading: loadingCourse } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => getCourseInfo(supabase, courseId),
    enabled: !!courseId,
  });

  const { data: studyRooms } = useQuery({
    queryKey: ["studyRooms", courseId],
    queryFn: () => getStudyRooms(supabase, courseId, user.id),
    enabled: !!courseId,
  });

  const { data: resourceRepository } = useQuery({
    queryKey: ["resourceRepository", courseId],
    queryFn: () => getResourceRepository(supabase, courseId),
    enabled: !!courseId,
  });

  const { data: forumRepository, isLoading: loadingForumRepo } = useQuery({
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

  const isLoading = loadingCourse || loadingForumRepo || postLoading || commentsLoading;
  const hasSidebarData = course && forumRepository && resourceRepository;

  if (isLoading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (!hasSidebarData) return <div className="flex justify-center items-center h-screen">Failed to load course information.</div>;
  if (postError || !post) return <div className="flex justify-center items-center h-screen">Error loading post or post not found.</div>;
  if (commentsError) return <div className="flex justify-center items-center h-screen">Error loading comments.</div>;

  const isDeleted = post.title === "DELETED" && post.content === "DELETED";

  return (
    <div className="flex h-screen">
      <div className="w-60 h-full flex-shrink-0 border-r overflow-y-auto">
        <CourseSidebar
          user={user}
          course={course}
          studyRooms={studyRooms ?? []}
          resourceRepository={resourceRepository}
          forumRepository={forumRepository}
        />
      </div>
      <main className="flex-1 min-w-0 overflow-auto">
        <div className="flex flex-col w-full px-6 py-4 max-w-4xl mx-auto">
            <ForumCardDetailed
                post={post}
                courseId={courseId}
                supabase={supabase}
                user={user}
            />
            {!isDeleted && (
              <>
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
                        <CommentCard
                            key={comment.id}
                            comment={comment}
                            supabase={supabase}
                            forumId={forumId}
                            originalPostAuthorId={post.author_id}
                        />
                    ))
                    ) : (
                    <p className="text-muted-foreground">No comments yet. Be the first to share your thoughts!</p>
                    )}
                </div>
              </>
            )}
        </div>
      </main>
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const supabase = createSupabaseServerClient(context);
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return { redirect: { destination: '/login', permanent: false } };
  }

  return { props: { user } };
}