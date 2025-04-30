import React, { useState } from "react";
import { useSupabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { ForumPost } from "@/utils/supabase/models/forum-post";
import { CreateForumPostModal } from "@/components/forum-repository/createForumPostModal";
import { ForumCard } from "@/components/forum-repository/forumCard";

type ForumRepositoryLayoutProps = {
  posts: ForumPost[] | undefined;
  isLoading: boolean;
  user: User;
  repositoryId: string;
  courseId: string;
};

export function ForumRepositoryLayout({
  posts,
  isLoading,
  user,
  repositoryId,
  courseId,
}: ForumRepositoryLayoutProps) {
  const supabase = useSupabase();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="flex flex-col w-full px-6 m-2">
      <div className="flex justify-end mb-4">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create New Post</Button>
          </DialogTrigger>
          <CreateForumPostModal
            open={isDialogOpen}
            setOpen={setIsDialogOpen}
            user={user}
            repositoryId={repositoryId}
            courseId={courseId}
          />
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center mt-10">Loading posts…</div>
      ) : (
        <div className="w-full max-w-4xl mx-auto">
          {posts && posts.length === 0 && (
            <p className="text-muted-foreground text-center mt-10">
              No posts yet. Be the first to create one!
            </p>
          )}
          {posts &&
            posts.map((post, index) => (
              <div key={post.id} className={index > 0 ? "mt-6" : ""}>
                <ForumCard
                  post={post}
                  courseId={courseId}
                  supabase={supabase}
                  user={user}
                  repositoryId={repositoryId}
                />
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
