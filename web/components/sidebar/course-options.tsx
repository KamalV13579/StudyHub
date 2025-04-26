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
  getCourses,
} from "@/utils/supabase/queries/course";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Switch } from "@/components/ui/switch";
import router from "next/router";
import { User } from "@supabase/supabase-js";
import { useSupabase } from "@/lib/supabase";
import { broadcastUserChange } from "@/utils/supabase/realtime/broadcasts";

type CourseOptionsProps = {
  hovering?: boolean;
  course: z.infer<typeof Course>;
  user: User;
};

export default function CourseOptions({ hovering, course, user }: CourseOptionsProps) {
  const queryUtils = useQueryClient();
  const supabase = useSupabase();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);

  const [isInstructor, setIsInstructor] = useState<boolean>(false);

  const { data: membership, refetch: refetchMembership } = useQuery({
    queryKey: ["courseMembership", course.id],
    queryFn: () => getCourseMembership(supabase, course.id, user.id),
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
      await toggleInstructorStatus(supabase, course.id, user.id);
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

  const handleDeleteCourse = async () => {
    try {
      await deleteCourse(supabase, course.id, user.id);

      await broadcastUserChange(supabase);

      toast("Course deleted.");
      queryUtils.refetchQueries({ queryKey: ["courses"] });
      const courses = await getCourses(supabase, user.id);
      if (!courses || courses.length === 0) {
        router.push(`/`)
      } else {
        router.push(`/course/${courses[0].id}`);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast(`Error deleting course: ${errorMessage}`);
    }
  }

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
        {/* Toggle Instructor */}
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
              <Button
                onClick={handleDeleteCourse}
                variant="destructive"
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

