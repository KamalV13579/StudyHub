import { Settings, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
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
import { z } from "zod";
import { Course } from "@/utils/supabase/models/course";
import {
  deleteCourse,
  toggleInstructorStatus,
  getCourseMembership,
} from "@/utils/supabase/queries/course";
import { createSupabaseComponentClient } from "@/utils/supabase/clients/component";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Switch } from "@/components/ui/switch";

type CourseOptionsProps = {
  hovering?: boolean;
  course: z.infer<typeof Course>;
};

export default function CourseOptions({ hovering, course }: CourseOptionsProps) {
  const supabase = createSupabaseComponentClient();
  const queryUtils = useQueryClient();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);

  const [isInstructor, setIsInstructor] = useState<boolean>(false);

  const { data: membership, refetch: refetchMembership } = useQuery({
    queryKey: ["courseMembership", course.id],
    queryFn: () => getCourseMembership(supabase, course.id),
    // enable only if course.id available
    enabled: !!course.id,
  });

  useEffect(() => {
    if (membership && typeof membership.is_tutor === "boolean") {
      setIsInstructor(membership.is_tutor);
    }
  }, [membership]);

  const handleToggleInstructor = async (e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      await toggleInstructorStatus(supabase, course.id);
      setIsInstructor((prev) => !prev);
      toast.success("Instructor status updated.");
      queryUtils.refetchQueries({ queryKey: ["courses"] });
      refetchMembership();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(`Error toggling instructor status: ${errorMessage}`);
    }
  };

  return (
    <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
      <DropdownMenuTrigger
        asChild
        className={cn(hovering || dropdownOpen ? "visible" : "invisible")}
      >
        <Button variant="ghost" size="icon" className="hover:cursor-pointer">
          <Settings className="text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        {/* Toggle Instructor using a Switch within a container that stops propagation */}
        <DropdownMenuItem asChild>
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-between w-full px-2 py-1"
          >
            <span>Mark as Instructor/Tutor</span>
            <Switch
              checked={isInstructor}
              onCheckedChange={() => {}}
              onClick={handleToggleInstructor}
              className="ml-2"
            />
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Delete Confirmation */}
        <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem
              onClick={(e) => {
                e.preventDefault();
                setDeleteAlertOpen(true);
              }}
              variant="destructive"
            >
              <Trash />
              Delete
            </DropdownMenuItem>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Are you sure you want to delete this course?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Deleting a course is permanent and cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={async () => {
                  setDeleteAlertOpen(false);
                }}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  await deleteCourse(supabase, course.id);
                  toast("Course deleted.");
                  queryUtils.refetchQueries({ queryKey: ["courses"] });
                }}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

