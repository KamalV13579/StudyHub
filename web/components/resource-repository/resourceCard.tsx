import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown } from "lucide-react";
import { useRouter } from "next/router";
import { useSupabase } from "@/lib/supabase";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getResourceVoteCount, handleResourceVote } from "@/utils/supabase/queries/resource-repository";
import { User } from "@supabase/supabase-js";

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
  const { courseId } = router.query;
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  const { data: voteCount = 0 } = useQuery({
    queryKey: ["voteCount", resource.id],
    queryFn: () => getResourceVoteCount(supabase, resource.id),
    enabled: !!resource.id,
  });

  const handleVote = async (voteValue: 1 | -1, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.id) {
      console.error("User ID missing. Cannot vote.");
      return;
    }

    try {
      console.log("Submitting vote:", { resourceId: resource.id, profileId: user.id, voteValue });
      await handleResourceVote(supabase, resource.id, user.id, voteValue);
      await queryClient.invalidateQueries({ queryKey: ["voteCount", resource.id] });
    } catch (err) {
      console.error("Error voting:", err);
    }
  };

  const handleCardClick = () => {
    router.push(`/course/${courseId}/resource-repository/resource/${resource.id}`);
  };

  return (
    <Card
      onClick={handleCardClick}
      className="w-full p-6 hover:shadow-lg cursor-pointer flex flex-col justify-between relative"
    >
      <div className="absolute top-4 right-4 text-xs text-muted-foreground">
        Uploaded by {resource.handle ?? "Unknown"}
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold">{resource.title}</h2>
        <p className="text-muted-foreground text-sm">
          {resource.description.length > 100
            ? resource.description.slice(0, 100) + "..."
            : resource.description}
        </p>
      </div>

      <div className="flex items-center justify-center gap-4 mt-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => handleVote(1, e)}
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
        <span className="text-sm">{voteCount}</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => handleVote(-1, e)}
        >
          <ArrowDown className="h-5 w-5" />
        </Button>
      </div>
    </Card>
  );
}
