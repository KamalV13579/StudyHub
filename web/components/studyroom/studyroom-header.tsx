/**
 * Header to show on each server page.
 *
 * @author Ajay Gandecha <ajay@class.unc.edu>
 * @author Jade Keegan <jade@cs.unc.edu>
 */

import { ChevronDown, Copy, Search, UsersRound } from "lucide-react";
import { Input } from "../ui/input";
import { z } from "zod";
import { StudyRoom } from "@/utils/supabase/models/studyroom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useState } from "react";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";

type StudyRoomHeaderProps = {
  user: User;
  selectedStudyRoom?: z.infer<typeof StudyRoom>;
  filterQuery: string;
  setFilterQuery: (query: string) => void;
};
export default function StudyRoomHeader({
  selectedStudyRoom,
  filterQuery,
  setFilterQuery,
}: StudyRoomHeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Create states to handle selecting and uploading files.

  return (
    <header className="bg-sidebar flex flex-row shrink-0 items-center gap-2 border-b z-50 h-14">
      <DropdownMenu
        open={dropdownOpen}
        onOpenChange={(isOpen) => setDropdownOpen(isOpen)}
      >
        <DropdownMenuTrigger
          className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          asChild
        >
          <div className="flex flex-row w-[240px] items-center justify-between h-full border-r p-3">
            <div className="flex flex-row items-center h-full gap-2">
              <UsersRound className="size-5 text-muted-foreground" />
              <p className="font-bold truncate w-[70px]">
                {selectedStudyRoom?.title ?? ""}
              </p>
            </div>
            <ChevronDown className="size-4" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
          side="bottom"
          align="end"
          sideOffset={4}
        >
          <DropdownMenuSeparator />
          {/* Copy Join Code */}
          <DropdownMenuItem
            onClick={async () => {
              await navigator.clipboard.writeText(selectedStudyRoom?.id ?? "");
              toast("Join code copied to clipboard.");
            }}
          >
            <Copy />
            Copy Join Code
          </DropdownMenuItem>
          <DropdownMenuSeparator />
        </DropdownMenuContent>
      </DropdownMenu>
      <div className="flex flex-row grow items-center justify-between h-full border-r p-3">
        <div className="flex flex-row items-center h-full gap-2">
          <div className="relative grow">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search study room..."
              className="h-9 pl-8 bg-background"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
