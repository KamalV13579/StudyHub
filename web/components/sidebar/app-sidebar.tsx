/* eslint-disable @next/next/no-img-element */
import { Plus } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarGroupContent,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createSupabaseComponentClient } from "@/utils/supabase/clients/component";
import { getCourses, joinCourse } from "@/utils/supabase/queries/course";
import { broadcastUserChange } from "@/utils/supabase/realtime/broadcasts";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/router";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import AppSidebarItem from "@/components/sidebar/app-sidebar-item";
import { Separator } from "@/components/ui/separator";
import { NavUser } from "@/components/sidebar/nav-user";

type AppSidebarProps = { user: User } & React.ComponentProps<typeof Sidebar>;

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const supabase = createSupabaseComponentClient();
  const queryUtils = useQueryClient();
  const router = useRouter();

  const { data: courses } = useQuery({
    queryKey: ["courses"],
    queryFn: () => getCourses(supabase),
  });

  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [courseNumber, setCourseNumber] = useState("");
  const [isInstructor, setIsInstructor] = useState(false);

  const handleJoinCourse = () => {
    const courseCode = `${subject.toUpperCase().trim()} ${courseNumber.trim()}`;
    console.log("[handleJoinCourse] Concatenated courseCode:", courseCode);
    console.log("[handleJoinCourse] Is Instructor?", isInstructor);

    joinCourse(supabase, courseCode, isInstructor)
      .then((course) => {
        console.log("[handleJoinCourse] Joined course object:", course);
        if (course.alreadyJoined) {
          toast("Course already joined.");
        } else {
          toast.success("Course joined.");
        }
        broadcastUserChange(supabase);
        queryUtils.refetchQueries({ queryKey: ["courses"] });
        setJoinDialogOpen(false);

        if (!courses || courses.length === 0) {
          router.push(`/course/${course.id}`);
        }
      })
      .catch((error) => {
        console.error("[handleJoinCourse] Failed to join course:", error);
        if (error?.message?.includes("Course not found")) {
          toast.error(
            `Course not found: "${courseCode}". Please check the course code you provided.`
          );
        } else {
          toast.error("Error: Invalid course code. Please try again.");
        }
      });
  };

  return (
    <Sidebar className="h-screen border-r flex flex-col" {...props}>
      <SidebarHeader className="flex items-center justify-center h-[125px]">
        <img
          src="https://kzyyqceiufmftdesrefz.supabase.co/storage/v1/object/public/public-images//logo.png"
          alt="Logo"
          className="h-3/4 w-3/4 object-contain"
        />
      </SidebarHeader>
      <div className="px-4">
        <SidebarHeader className="flex flex-row justify-between items-center px-0 pt-1 pb-1 text-sm font-semibold text-muted-foreground uppercase">
          <span className="inline-flex items-center">Courses</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setJoinDialogOpen(true)}
            className="rounded"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </SidebarHeader>
      </div>

      <ScrollArea className="flex-1 overflow-y-auto">
        <SidebarContent className="pb-4">
          <SidebarGroup>
            <SidebarGroupContent className="px-2 py-1 list-none">
              {courses?.map((course) => (
                <AppSidebarItem
                  key={course.id}
                  course={course}
                  selectedCourseId={router.query.courseId as string}
                />
              ))}
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </ScrollArea>

      <Separator />

      <SidebarFooter className="p-4">
        <NavUser user={user} />
      </SidebarFooter>

      {/* Join Course Dialog */}
      <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
        <DialogContent className="sm:max-w-[425px] mx-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Join a Course</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Enter the subject & course number (e.g., COMP and 426).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="flex gap-2">
              <Input
                placeholder="Subject (e.g. COMP)"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full"
              />
              <Input
                placeholder="Course # (e.g. 426)"
                value={courseNumber}
                onChange={(e) => setCourseNumber(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="instructor"
                checked={isInstructor}
                onChange={(e) => setIsInstructor(e.target.checked)}
                className="h-4 w-4"
                title="Mark as Instructor or Tutor"
              />
              <Label htmlFor="instructor" className="text-sm">
                Mark as Instructor/Tutor
              </Label>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button onClick={handleJoinCourse} disabled={!subject || !courseNumber} className="w-full">
              Join Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sidebar>
  );
}
