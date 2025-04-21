import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { getCourseInfo } from "@/utils/supabase/queries/course";
import { getStudyRooms } from "@/utils/supabase/queries/studyroom";
import { getResourceRepository } from "@/utils/supabase/queries/resource-repository";
import { getForumRepository } from "@/utils/supabase/queries/forum-repository";
import { createForum } from "@/utils/supabase/queries/forum";
import { getForumPostsByRepositoryId, createForumPost } from "@/utils/supabase/queries/forum-post";
import { CourseLayout } from "@/components/course/courseLayout";
import { ForumRepositoryLayout } from "@/components/forum-repository/forumRepositoryLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { GetServerSidePropsContext } from "next";
import { createSupabaseServerClient } from "@/utils/supabase/clients/server-props";

type ForumRepositoryHomePageProps = {
  user: User;
};

export default function ForumRepositoryHomePage({ user }: ForumRepositoryHomePageProps) {
  const router = useRouter();
  const courseId = router.query.courseId as string;
  const repositoryId = router.query.repositoryId as string;
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  const { data: course } = useQuery({
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

  const { data: forumRepository } = useQuery({
    queryKey: ["forumRepository", courseId],
    queryFn: () => getForumRepository(supabase, courseId),
    enabled: !!courseId,
  });

  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ["forumPosts", repositoryId],
    queryFn: () => getForumPostsByRepositoryId(supabase, repositoryId),
    enabled: !!repositoryId,
  });

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    setSubmitting(true);
    try {
      const forum = await createForum(supabase, courseId, repositoryId, title);
      await createForumPost(supabase, forum.id, user.id, title, content, null);
      setTitle("");
      setContent("");
      await queryClient.invalidateQueries({ queryKey: ["forumPosts", repositoryId] });
      setIsDialogOpen(false);
    } catch (err) {
      console.error("Error creating post:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!course) return <div>Loading course info…</div>;
  if (!forumRepository) return <div>Loading forum repository…</div>;

  return (
    <CourseLayout
      user={user}
      course={course}
      studyRooms={studyRooms ?? []}
      resourceRepository={resourceRepository!}
      forumRepository={forumRepository!}
    >
      <ForumRepositoryLayout>
        <div className="flex justify-end mb-4">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>Create New Post</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Post</DialogTitle>
                <DialogDescription>
                  Fill in the details for your new forum post. Click submit when you are done.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="title" className="text-right">
                      Title
                    </Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="col-span-3"
                      required
                      placeholder="Post title"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="content" className="text-right">
                      Content
                    </Label>
                    <Textarea
                      id="content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="col-span-3"
                      required
                      placeholder="Write your content..."
                      rows={4}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Posting…" : "Submit Post"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {postsLoading ? (
           <div>Loading posts…</div>
        ) : (
          <div className="space-y-4 w-full max-w-4xl mx-auto">
            {posts && posts.length === 0 && <p>No posts yet. Be the first to create one!</p>}
            {posts && posts.map((post) => (
              <Link key={post.id} href={`/course/${courseId}/forum-repository/forum/${post.forum_id}`} passHref>
                <Card className="cursor-pointer hover:bg-muted/50 transition">
                  <CardHeader>
                    <CardTitle>{post.title}</CardTitle>
                    <CardDescription>
                      Posted by User {post.author_id} on {new Date(post.created_at).toLocaleString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {post.content}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" size="sm">View Post</Button>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        )}

      </ForumRepositoryLayout>
    </CourseLayout>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const supabase = createSupabaseServerClient(context);
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData?.user) {
    return { redirect: { destination: "/login", permanent: false } };
  }

  return { props: { user: userData.user } };
}