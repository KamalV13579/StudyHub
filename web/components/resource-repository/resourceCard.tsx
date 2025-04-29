import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, Trash } from "lucide-react";
import { useRouter } from "next/router";
import { useSupabase } from "@/lib/supabase";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getResourceVoteCount,
  handleResourceVote,
  getUserResourceVote,
  deleteResource,
} from "@/utils/supabase/queries/resource-repository";
import { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

type ResourceCardProps = {
  resource: {
    id: string;
    title: string;
    description: string;
    uploaded_by: string;
    handle?: string;
  };
  user: User;
};

export function ResourceCard({ resource, user }: ResourceCardProps) {
  const router = useRouter();
  const { courseId, repositoryId } = router.query;
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  const { data: initialVoteCount = 0, refetch: refetchVoteCount } = useQuery({
    queryKey: ["voteCount", resource.id],
    queryFn: () => getResourceVoteCount(supabase, resource.id),
    enabled: !!resource.id,
  });

  const { data: userVote, refetch: refetchUserVote } = useQuery({
    queryKey: ["userVote", resource.id, user.id],
    queryFn: () => getUserResourceVote(supabase, resource.id, user.id),
    enabled: !!resource.id && !!user.id,
  });

  const [voteCount, setVoteCount] = useState(initialVoteCount);

  useEffect(() => {
    setVoteCount(initialVoteCount);
  }, [initialVoteCount]);

  const handleVote = async (voteValue: 1 | -1, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.id) return;

    try {
      await handleResourceVote(supabase, resource.id, user.id, voteValue);
      await refetchVoteCount();
      await refetchUserVote();
    } catch (err) {
      console.error("Failed to submit vote:", err);
    }
  };

  const handleCardClick = () => {
    router.push(
      `/course/${courseId}/resource-repository/${repositoryId}/resource/${resource.id}`
    );
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmDelete = window.confirm("Are you sure you want to delete this resource?");
    if (!confirmDelete) return;

    try {
      await deleteResource(supabase, resource.id);
      queryClient.invalidateQueries({ queryKey: ["resources"] });
    } catch (error) {
      console.error("Failed to delete resource:", error);
    }
  };

  // 📡 Realtime voting updates
 useEffect(() => {
  if (!resource.id) return;

  const channel = supabase
    .channel(`resource_vote_${resource.id}`)
    .on(
      'postgres_changes',
      {
        event: '*', // listen to INSERT, UPDATE, DELETE
        schema: 'public',
        table: 'resource_vote',
      },
      (payload) => {
        console.log("Vote change detected!", payload);

        const newResourceId = (payload.new as any)?.resource_id;
        const oldResourceId = (payload.old as any)?.resource_id;

        if (newResourceId === resource.id || oldResourceId === resource.id) {
          refetchVoteCount(); // ✅ Only refetch if it's related to this resource
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel); // cleanup on unmount
  };
}, [resource.id, supabase, refetchVoteCount]);

  return (
    <Card
      onClick={handleCardClick}
      className="w-full p-6 hover:shadow-lg cursor-pointer flex flex-col justify-between relative"
    >
      {/* Uploaded By */}
      <div className="absolute top-4 right-4 text-xs text-muted-foreground">
        Uploaded by {resource.handle ?? "Unknown"}
      </div>

      {/* Main content */}
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold">{resource.title}</h2>
        <p className="text-muted-foreground text-sm">
          {resource.description.length > 100
            ? resource.description.slice(0, 100) + "..."
            : resource.description}
        </p>
      </div>

      {/* Voting and Delete on the same row */}
      <div className="flex items-center justify-between mt-6">
        {/* Voting Centered Group */}
        <div className="flex items-center gap-4 mx-auto">
          <Button
            variant={userVote === 1 ? "default" : "ghost"}
            size="icon"
            onClick={(e) => handleVote(1, e)}
          >
            <ArrowUp className="h-5 w-5" />
          </Button>
          <span className="text-sm">{voteCount}</span>
          <Button
            variant={userVote === -1 ? "default" : "ghost"}
            size="icon"
            onClick={(e) => handleVote(-1, e)}
          >
            <ArrowDown className="h-5 w-5" />
          </Button>
        </div>

        {/* Delete button to the far right */}
        {user.id === resource.uploaded_by && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            className="flex items-center gap-2"
          >
            <Trash className="h-4 w-4" />
            Delete
          </Button>
        )}
      </div>
    </Card>
  );
}
