import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown } from "lucide-react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { getResourceVoteCount, handleResourceVote } from "@/utils/supabase/queries/resource-repository";
import { useSupabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

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

export function ResourceDetailCard({ resource, user }: ResourceDetailCardProps) {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  const { data: voteCount = 0 } = useQuery({
    queryKey: ["voteCount", resource.id],
    queryFn: () => getResourceVoteCount(supabase, resource.id),
    enabled: !!resource.id,
  });

  const handleVote = async (voteValue: 1 | -1, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.id) return;

    try {
      await handleResourceVote(supabase, resource.id, user.id, voteValue);
      queryClient.invalidateQueries({ queryKey: ["voteCount", resource.id] }); // Refresh vote count
    } catch (err) {
      console.error("Failed to submit vote:", err);
    }
  };

  const handleDownload = (filePath: string) => {
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/resources/${filePath}`;
    window.open(url, "_blank");
  };

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

      <div className="flex items-center justify-center gap-4 mt-6">
        <Button variant="ghost" size="icon" onClick={(e) => handleVote(1, e)}>
          <ArrowUp className="h-5 w-5" />
        </Button>
        <span className="text-sm">{voteCount}</span>
        <Button variant="ghost" size="icon" onClick={(e) => handleVote(-1, e)}>
          <ArrowDown className="h-5 w-5" />
        </Button>
      </div>
    </Card>
  );
}
