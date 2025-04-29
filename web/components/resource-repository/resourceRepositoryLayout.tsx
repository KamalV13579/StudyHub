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

const RESOURCES_PER_PAGE = 50;

export function ResourceRepositoryLayout({ resources, user, repositoryId }: ResourceRepositoryLayoutProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [showOnlyMyResources, setShowOnlyMyResources] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredResources = resources.filter((resource) => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesOwner = !showOnlyMyResources || resource.uploaded_by === user.id;
    return matchesSearch && matchesOwner;
  });

  const totalPages = Math.ceil(filteredResources.length / RESOURCES_PER_PAGE);
  const paginatedResources = filteredResources.slice(
    (currentPage - 1) * RESOURCES_PER_PAGE,
    currentPage * RESOURCES_PER_PAGE
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const toggleShowMyResources = () => {
    setShowOnlyMyResources((prev) => !prev);
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col w-full px-6 m-2">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Input
          placeholder="Search resources..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="flex-1 min-w-[250px]"
        />

        <div className="flex items-center gap-2">
          <Button
            variant={showOnlyMyResources ? "default" : "outline"}
            onClick={toggleShowMyResources}
            className="whitespace-nowrap"
          >
            {showOnlyMyResources ? "Show All" : "My Resources"}
          </Button>

          <Button
            className="whitespace-nowrap"
            onClick={() => setModalOpen(true)}
          >
            Create New Resource
          </Button>
        </div>
      </div>

      <div className="flex flex-col w-full gap-6 mt-6">
        {paginatedResources.length > 0 ? (
          paginatedResources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} user={user} />
          ))
        ) : (
          <div className="text-muted-foreground text-center mt-10">
            No resources found.
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <Button
            variant="outline"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      <CreateResourceModal
        open={modalOpen}
        setOpen={setModalOpen}
        user={user}
        repositoryId={repositoryId}
      />
    </div>
  );
}
