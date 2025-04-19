import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useState } from "react";
import { uploadResourceFile, createResourceEntry } from "@/utils/supabase/queries/resource-repository";
import { useSupabase } from "@/lib/supabase";
import { useRouter } from "next/router";
import { useQueryClient } from "@tanstack/react-query";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";

type CreateResourceModalProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  user: User;
  repositoryId: string;
};

const RESOURCE_TYPES = ["Study Guide", "Lecture Notes", "Supplemental"];

export function CreateResourceModal({ open, setOpen, user, repositoryId }: CreateResourceModalProps) {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !file || !type) {
      toast.error("Please fill all fields, select type, and upload a file.");
      return;
    }

    try {
      setUploading(true);

      const resourceId = crypto.randomUUID();
      const filePath = await uploadResourceFile(supabase, file, resourceId);

      await createResourceEntry(supabase, {
        title,
        description,
        uploaded_by: user.id,
        repository_id: repositoryId,
        file_url: filePath,
        type,
      });

      toast.success("Resource created successfully!");

      // Reset form
      setTitle("");
      setDescription("");
      setFile(null);
      setType("");
      setOpen(false);

      // Refresh the resources
      queryClient.invalidateQueries({ queryKey: ["resources", repositoryId] });

    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to create resource.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Resource</DialogTitle>
          <DialogDescription>Post a new resource by filling the details below.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          <Input
            placeholder="Resource title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={uploading}
          />
          <Textarea
            placeholder="Resource description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={uploading}
          />
          <Select
            value={type}
            onValueChange={(value) => setType(value)}
            disabled={uploading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select resource type" />
            </SelectTrigger>
            <SelectContent>
              {RESOURCE_TYPES.map((resourceType) => (
                <SelectItem key={resourceType} value={resourceType}>
                  {resourceType}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            disabled={uploading}
          />
        </div>

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={uploading || !title.trim() || !description.trim() || !file || !type}
          >
            {uploading ? "Uploading..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
