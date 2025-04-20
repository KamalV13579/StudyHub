import { Settings, Trash, Edit, Copy, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
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
import {
  deleteStudyRoom,
  updateStudyRoomName,
  leaveStudyRoom,
  getStudyRooms,
} from "@/utils/supabase/queries/studyroom";
import { z } from "zod";
import { StudyRoom } from "@/utils/supabase/models/studyroom";
import router from "next/router";
import { User } from "@supabase/supabase-js";
import { useSupabase } from "@/lib/supabase";

type StudyRoomOptionsProps = {
  hovering?: boolean;
  studyRoom: z.infer<typeof StudyRoom>;
  isOwner: boolean;
  user: User;
};

export default function StudyRoomOptions({
  hovering,
  studyRoom,
  isOwner,
  user,
}: StudyRoomOptionsProps) {
  const queryClient = useQueryClient();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState(studyRoom.title);
  const supabase = useSupabase();

  // Handler for updating the study room name (for owners).
  const handleUpdateName = async () => {
    if (newTitle.trim() === "") {
      toast.error("Title cannot be empty.");
      return;
    }
    try {
      await updateStudyRoomName(supabase, studyRoom.id, newTitle);
      toast.success("Study room name updated.");

      // Add this invalidation
      queryClient.invalidateQueries({
        queryKey: ["study_room", studyRoom.id],
        exact: true,
      });

      // Keep existing invalidations
      queryClient.refetchQueries({
        queryKey: ["studyRooms", studyRoom.course_id],
      });

      setEditDialogOpen(false);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Error updating study room.");
      }
    }
  };

  // Handler for deleting the study room (for owners).
  const handleDeleteStudyRoom = async () => {
    try {
      await deleteStudyRoom(supabase, studyRoom.id);
      toast.success("Study room deleted.");
      queryClient.refetchQueries({
        queryKey: ["studyRooms", studyRoom.course_id], // Ensure correct query key
      });
      router.push(`/course/${studyRoom.course_id}`); // Redirect after deletion
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Error leaving study room.");
      }
    }
  };

  // Handler for leaving the study room (for non-owners).
  const handleLeaveStudyRoom = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await leaveStudyRoom(supabase, studyRoom.id, user.id);
      toast.success("Left study room.");
      queryClient.refetchQueries({
        queryKey: ["studyRooms", studyRoom.course_id],
      });
      router.push(`/course/${studyRoom.course_id}`); // Redirect after leaving
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Error leaving study room.");
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
          <Button
            variant="ghost"
            size="icon"
            className={cn(hovering || dropdownOpen ? "visible" : "invisible")}
          >
            <Settings className="text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {isOwner ? (
            <>
              {/* Owner Options */}
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
              <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setAlertOpen(true);
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
                      Deleting this study room is permanent and cannot be
                      undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setAlertOpen(false)}>
                      Cancel
                    </AlertDialogCancel>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteStudyRoom}
                    >
                      Delete
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          ) : (
            <>
              {/* Non-Owner Options */}
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
              <DropdownMenuItem
                variant="destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  handleLeaveStudyRoom(e);
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Leave Study Room
              </DropdownMenuItem>
            </>
          )}
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
