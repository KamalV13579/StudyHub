import React, { useState, useEffect } from "react";
import { useSupabase } from "@/lib/supabase";
import { User, SupabaseClient } from "@supabase/supabase-js";
import { getOrUpsertForumMembershipAnonymousStatus } from "@/utils/supabase/queries/forum-membership";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { ForumPost } from "@/utils/supabase/models/forum-post";
import { CreateForumPostModal } from "@/components/forum-repository/createForumPostModal";
import { ForumCard } from "@/components/forum-repository/forumCard";

export const PostAuthorDisplay = ({ supabase, forumId, authorId, createdAt }: { supabase: SupabaseClient, forumId: string, authorId: string, createdAt: string }) => {
  const [displayName, setDisplayName] = useState<string>('Loading...');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchStatusAndName = async () => {
      setIsLoading(true);
      try {
        const isAnonymous = await getOrUpsertForumMembershipAnonymousStatus(supabase, forumId, authorId);
        let name = 'Anonymous';

        if (!isAnonymous) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', authorId)
            .single();

          if (profileError || !profile?.username) {
            console.warn(`Could not fetch username for ${authorId}, falling back to ID.`);
            name = `User ${authorId.substring(0, 8)}...`;
          } else {
            name = profile.username;
          }
        }

        if (isMounted) {
          setDisplayName(name);
        }
      } catch (error) {
        console.error("Error fetching author display info:", error);
        if (isMounted) {
          setDisplayName(`User ${authorId.substring(0, 8)}...`);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchStatusAndName();

    return () => {
      isMounted = false;
    };
  }, [supabase, forumId, authorId]);

  return (
    <>
      Posted by {isLoading ? 'Loading...' : displayName} on {new Date(createdAt).toLocaleString()}
    </>
  );
};

type ForumRepositoryLayoutProps = {
  posts: ForumPost[] | undefined;
  isLoading: boolean;
  user: User;
  repositoryId: string;
  courseId: string;
};

export function ForumRepositoryLayout({ posts, isLoading, user, repositoryId, courseId }: ForumRepositoryLayoutProps) {
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
          {posts && posts.map((post, index) => (
            <div key = {post.id} className = {index > 0 ? "mt-6" : ""}>
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