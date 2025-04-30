import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, Trash } from "lucide-react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import {
  getResourceVoteCount,
  getUserResourceVote,
  handleResourceVote,
  deleteResource,
} from "@/utils/supabase/queries/resource-repository";
import { useSupabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

interface ResourceVotePayload {
  resource_id: string;
  profile_id?: string;
  value?: number;
}
type ResourceDetailCardProps = {
  resource: {
    id: string;
    title: string;
    description: string;
    file_url: string | null;
    uploaded_by: string;
    handle?: string;
  };
  user: User;
};

export function ResourceDetailCard({
  resource,
  user,
}: ResourceDetailCardProps) {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { courseId } = router.query;
  const { resource_id } = router.query;
  


  const { data: voteCount = 0, refetch: refetchVoteCount } = useQuery({
    queryKey: ["voteCount", resource.id],
    queryFn: () => getResourceVoteCount(supabase, resource.id),
    enabled: !!resource.id,
  });

  const { data: userVote, refetch: refetchUserVote } = useQuery({
    queryKey: ["userVote", resource.id, user.id],
    queryFn: () => getUserResourceVote(supabase, resource.id, user.id),
    enabled: !!resource.id && !!user.id,
  });

  const [voteInProgress, setVoteInProgress] = useState(false);

  const handleVote = async (voteValue: 1 | -1, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.id || voteInProgress) return;

    setVoteInProgress(true);
    try {
      await handleResourceVote(supabase, resource.id, user.id, voteValue);
      await refetchVoteCount();
      await refetchUserVote();
    } catch (err) {
      console.error("Failed to submit vote:", err);
    } finally {
      setVoteInProgress(false);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this resource?",
    );
    if (!confirmDelete) return;

    try {
      await deleteResource(supabase, resource.id);
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      router.push(`/course/${courseId}/resource-repository/${resource_id}`);
    } catch (error) {
      console.error("Failed to delete resource:", error);
    }
  };

  const handleDownload = (filePath: string) => {
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/resources/${filePath}`;
    window.open(url, "_blank");
  };

  useEffect(() => {
    if (!resource.id) return;

    const channel = supabase
      .channel(`resource_vote_${resource.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "resource_vote",
        },
        (payload) => {
          const newId = (payload.new as ResourceVotePayload)?.resource_id;
          const oldId = (payload.old as ResourceVotePayload)?.resource_id;
          if (newId === resource.id || oldId === resource.id) {
            refetchVoteCount();
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [resource.id, supabase, refetchVoteCount]);

  let files: string[] = [];
  try {
    if (resource.file_url) {
      files = Array.isArray(JSON.parse(resource.file_url))
        ? JSON.parse(resource.file_url)
        : [resource.file_url];
    }
  } catch {
    files = resource.file_url ? [resource.file_url] : [];
  }

  return (
    <Card className="relative p-6 flex flex-col gap-4">
      <div className="absolute top-4 right-4 text-xs text-muted-foreground">
        Uploaded by {resource.handle ?? "Unknown"}
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold">{resource.title}</h1>
        <p className="text-muted-foreground">{resource.description}</p>
      </div>

      {files.length > 0 ? (
        <div className="flex flex-col gap-2">
          {files.map((filePath, idx) => (
            <Button
              key={idx}
              variant="outline"
              onClick={() => handleDownload(filePath)}
              className="justify-start"
            >
              {filePath.split("/").pop()}
            </Button>
          ))}
        </div>
      ) : (
        <div className="text-sm text-muted-foreground">
          No files available for this resource.
        </div>
      )}

      <div className="flex items-center justify-between mt-6">
        <div className="flex items-center gap-4 mx-auto">
          <Button
            variant={userVote === 1 ? "default" : "ghost"}
            size="icon"
            disabled={voteInProgress}
            onClick={(e) => handleVote(1, e)}
          >
            <ArrowUp className="h-5 w-5" />
          </Button>
          <span className="text-sm">{voteCount}</span>
          <Button
            variant={userVote === -1 ? "default" : "ghost"}
            size="icon"
            disabled={voteInProgress}
            onClick={(e) => handleVote(-1, e)}
          >
            <ArrowDown className="h-5 w-5" />
          </Button>
        </div>

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
