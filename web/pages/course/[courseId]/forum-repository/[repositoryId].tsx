import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/router"
import { useQuery } from "@tanstack/react-query"
import { useSupabase } from "@/lib/supabase"
import { User } from "@supabase/supabase-js"
import { getCourseInfo } from "@/utils/supabase/queries/course"
import { getStudyRooms } from "@/utils/supabase/queries/studyroom"
import { getResourceRepository } from "@/utils/supabase/queries/resource-repository"
import { getForumRepository } from "@/utils/supabase/queries/forum-repository"
import { createForum } from "@/utils/supabase/queries/forum"
import { getForumPosts, createForumPost } from "@/utils/supabase/queries/forum-post"
import { CourseLayout } from "@/components/course/courseLayout"
import { ForumRepositoryLayout } from "@/components/forum-repository/forumRepositoryLayout"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { GetServerSidePropsContext } from "next"
import { createSupabaseServerClient } from "@/utils/supabase/clients/server-props"

type ForumRepositoryHomePageProps = {
  user: User
}

export default function ForumRepositoryHomePage({ user }: ForumRepositoryHomePageProps) {
  const router = useRouter()
  const courseId = router.query.courseId as string
  const repositoryId = router.query.repositoryId as string
  const supabase = useSupabase()

  const { data: course } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => getCourseInfo(supabase, courseId),
    enabled: !!courseId
  })

  const { data: studyRooms } = useQuery({
    queryKey: ["studyRooms", courseId],
    queryFn: () => getStudyRooms(supabase, courseId, user.id),
    enabled: !!courseId
  })

  const { data: resourceRepository } = useQuery({
    queryKey: ["resourceRepository", courseId],
    queryFn: () => getResourceRepository(supabase, courseId),
    enabled: !!courseId
  })

  const { data: forumRepository } = useQuery({
    queryKey: ["forumRepository", courseId],
    queryFn: () => getForumRepository(supabase, courseId),
    enabled: !!courseId
  })

  const { data: posts, isLoading: postsLoading, refetch: refetchPosts } = useQuery({
    queryKey: ["forumPosts", repositoryId],
    queryFn: () => getForumPosts(supabase, repositoryId),
    enabled: !!repositoryId
  })

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !content) return
    setSubmitting(true)
    try {
      const forum = await createForum(supabase, courseId, repositoryId, title)
      if (!forum) throw new Error("Failed to create forum")
      await createForumPost(supabase, forum.id, user.id, title, content, null)
      setTitle("")
      setContent("")
      await refetchPosts()
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  if (!course) return <div>Loading course info…</div>
  if (!forumRepository) return <div>Loading forum repository…</div>
  if (postsLoading) return <div>Loading posts…</div>

  return (
    <CourseLayout
      user={user}
      course={course}
      studyRooms={studyRooms ?? []}
      resourceRepository={resourceRepository!}
      forumRepository={forumRepository!}
    >
      <ForumRepositoryLayout>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {posts!.length === 0 && <p>No posts yet.</p>}
          {posts!.map((post) => (
            <Link key={post.id} href={`/course/${courseId}/forum-repository/forum/${post.id}`}>
              <a>
                <Card className="cursor-pointer hover:shadow-lg transition">
                  <CardHeader>
                    <CardTitle>{post.title}</CardTitle>
                    <CardDescription>{post.content.slice(0, 100)}…</CardDescription>
                  </CardHeader>
                </Card>
              </a>
            </Link>
          ))}
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">New Post</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Post title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border p-2 w-full"
              required
            />
            <textarea
              placeholder="Write your content..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="border p-2 w-full"
              rows={4}
              required
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded"
              disabled={submitting}
            >
              {submitting ? "Posting…" : "Create Post"}
            </button>
          </form>
        </div>
      </ForumRepositoryLayout>
    </CourseLayout>
  )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const supabase = createSupabaseServerClient(context)
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData) {
    return { redirect: { destination: "/login", permanent: false } }
  }
  return { props: {} }
}