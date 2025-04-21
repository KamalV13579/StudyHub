import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ResourceCard } from "@/components/resource-repository/resourceCard";
import { CreateResourceModal } from "@/components/resource-repository/createResourceModal";
import { User } from "@supabase/supabase-js";

type ResourceRepositoryLayoutProps = {
  resources: {
    id: string;
    title: string;
    description: string;
    uploaded_by: string;
    file_url: string | null;
    type: string;
    created_at: string;
    repository_id: string;
    vote_count?: number;
  }[];
  user: User;
  repositoryId: string;
};

export function ResourceRepositoryLayout({ resources, user, repositoryId }: ResourceRepositoryLayoutProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const filteredResources = resources.filter((resource) =>
    resource.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col w-full px-6 m-2">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Input
          placeholder="Search resources..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 min-w-[250px]"
        />
        <Button className="whitespace-nowrap" onClick={() => setModalOpen(true)}>
          Create New Resource
        </Button>
      </div>

      <div className="flex flex-col w-full gap-6 mt-6">
        {filteredResources.length > 0 ? (
          filteredResources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} user={user}/>
          ))
        ) : (
          <div className="text-muted-foreground text-center mt-10">
            No resources found.
          </div>
        )}
      </div>

      <CreateResourceModal
        open={modalOpen}
        setOpen={setModalOpen}
        user={user}
        repositoryId={repositoryId}
      />
    </div>
  );
}
