// components/studyroom/StudyRoomOptions.tsx
import { Settings, Trash, Edit, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { createSupabaseComponentClient } from "@/utils/supabase/clients/component";
import { deleteStudyRoom, updateStudyRoomName } from "@/utils/supabase/queries/studyroom";
import { z } from "zod";
import { StudyRoom } from "@/utils/supabase/models/studyroom";

type StudyRoomOptionsProps = {
  hovering?: boolean;
  studyRoom: z.infer<typeof StudyRoom>;
};

export default function StudyRoomOptions({ hovering, studyRoom }: StudyRoomOptionsProps) {
  const supabase = createSupabaseComponentClient();
  const queryClient = useQueryClient();

  // Local state for dropdown, edit dialog, and delete alert
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState(studyRoom.title);

  // Handler for updating the study room name
  const handleUpdateName = async () => {
    if (newTitle.trim() === "") {
      toast.error("Title cannot be empty.");
      return;
    }
    try {
      await updateStudyRoomName(supabase, studyRoom.id, newTitle);
      toast.success("Study room name updated.");
      setEditDialogOpen(false);
      setDropdownOpen(false);
      queryClient.refetchQueries({ queryKey: ["studyrooms", studyRoom.course_id] });
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Error updating study room.");
      }
    }
  };

  // Handler for deleting the study room (and its memberships)
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteStudyRoom(supabase, studyRoom.id);
      toast.success("Study room deleted.");
      queryClient.refetchQueries({ queryKey: ["studyrooms", studyRoom.course_id] });
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Error deleting study room.");
      }
    }
  };

  // Handler for copying the study room code.
  const handleCopyCode = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(studyRoom.id);
      toast.success("Study room code copied to clipboard.");
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Error copying study room code.");
      }
    }
  };

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className={cn(hovering || dropdownOpen ? "visible" : "invisible")}>
            <Settings className="text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {/* Edit Option opens the edit dialog */}
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setEditDialogOpen(true);
            }}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Name
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {/* Copy Code Option */}
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              handleCopyCode(e);
            }}
          >
            <Copy className="mr-2 h-4 w-4" />
            Copy Code
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {/* Delete Option with AlertDialog */}
          <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteAlertOpen(true);
                }}
                variant="destructive"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Are you sure you want to delete this study room?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Deleting this study room is permanent and cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setDeleteAlertOpen(false)}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Study Room Name Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px] mx-auto">
          <DialogHeader>
            <DialogTitle>Edit Study Room Name</DialogTitle>
            <DialogDescription>
              Enter a new name for the study room.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-3">
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="New study room name"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button onClick={handleUpdateName} disabled={!newTitle.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
