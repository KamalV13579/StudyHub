import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "@/lib/supabase";
import { ResourceDetailCard } from "@/components/resource-repository/resourceDetailCard";
import { Comment } from "@/components/resource-repository/comment";
import { CommentForm } from "@/components/resource-repository/commentForm";
import { getResourceDetail, getCommentsForResource } from "@/utils/supabase/queries/resource-repository";
import { useState } from "react";

export default function ResourceDetailPage() {
  const router = useRouter();
  const { courseId, resourceId } = router.query as {
    courseId: string;
    resourceId: string;
  };

  const supabase = useSupabase();

  const { data: resource, isLoading: loadingResource } = useQuery({
    queryKey: ["resource", resourceId],
    queryFn: () => getResourceDetail(supabase, resourceId),
    enabled: !!resourceId,
  });

  const { data: rawComments, isLoading: loadingComments, refetch } = useQuery({
    queryKey: ["comments", resourceId],
    queryFn: () => getCommentsForResource(supabase, resourceId),
    enabled: !!resourceId,
  });

  const comments = rawComments ?? []; // fallback to empty array if undefined

  if (loadingResource) {
    return <div className="flex justify-center items-center h-screen">Loading resource...</div>;
  }

  if (!resource) {
    return <div className="flex justify-center items-center h-screen">Resource not found.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 flex flex-col gap-8">
      {/* Resource Card */}
      <ResourceDetailCard resource={resource} />

      {/* Comments Section */}
      <div className="flex flex-col gap-6">
        <h2 className="text-xl font-semibold">Comments</h2>

        {loadingComments ? (
          <div>Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="text-muted-foreground">No comments yet. Be the first to comment!</div>
        ) : (
          <div className="flex flex-col gap-4">
            {comments.map((comment) => (
              <Comment key={comment.id} comment={comment} />
            ))}
          </div>
        )}

        {/* Inline Comment Form */}
        <CommentForm
          resourceId={resourceId}
          onSuccess={() => {
            refetch(); // Refetch comments after posting
          }}
        />
      </div>
    </div>
  );
}
