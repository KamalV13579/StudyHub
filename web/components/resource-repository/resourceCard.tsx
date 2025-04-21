import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown } from "lucide-react";
import { useRouter } from "next/router";

type ResourceCardProps = {
  resource: {
    id: string;
    title: string;
    description: string;
    uploaded_by: string;
    vote_count?: number;
    handle?: string;
  };
};

export function ResourceCard({ resource }: ResourceCardProps) {
  const router = useRouter();
  const { courseId } = router.query;

  const handleCardClick = () => {
    router.push(`/course/${courseId}/resource-repository/resource/${resource.id}`);
  };

  const handleUpvote = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleDownvote = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <Card
      onClick={handleCardClick}
      className="w-full p-6 hover:shadow-lg cursor-pointer flex flex-col justify-between relative"
    >
      <div className="absolute top-4 right-4 text-xs text-muted-foreground">
        Uploaded by {resource.handle}
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
        <Button variant="ghost" size="icon" onClick={handleUpvote}>
          <ArrowUp className="h-5 w-5" />
        </Button>
        <span className="text-sm">{resource.vote_count ?? 0}</span>
        <Button variant="ghost" size="icon" onClick={handleDownvote}>
          <ArrowDown className="h-5 w-5" />
        </Button>
      </div>
    </Card>
  );
}
