import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown } from "lucide-react";

type ResourceDetailCardProps = {
  resource: {
    id: string;
    title: string;
    description: string;
    file_url: string | null;
    uploaded_by: string;
    vote_count?: number;
    handle?: string
  };
};

export function ResourceDetailCard({ resource }: ResourceDetailCardProps) {
  const handleDownload = (filePath: string) => {
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/resources/${filePath}`;
    window.open(url, "_blank");
  };

  const handleUpvote = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleDownvote = (e: React.MouseEvent) => {
    e.stopPropagation();
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
        Uploaded by {resource.handle}
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
