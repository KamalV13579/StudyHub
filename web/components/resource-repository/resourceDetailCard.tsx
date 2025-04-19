import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type ResourceDetailCardProps = {
  resource: {
    id: string;
    title: string;
    description: string;
    file_url: string | null;
  };
};

export function ResourceDetailCard({ resource }: ResourceDetailCardProps) {
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
    <Card className="p-6 flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">{resource.title}</h1>
        <p className="text-muted-foreground">{resource.description}</p>
      </div>

      {/* File Downloads */}
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
        <div className="text-sm text-muted-foreground">No files available for this resource.</div>
      )}
    </Card>
  );
}
