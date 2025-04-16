import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCourseInfo } from "@/utils/supabase/queries/course";
import { getStudyRooms } from "@/utils/supabase/queries/studyroom";
import { createStudyRoom, joinStudyRoom } from "@/utils/supabase/queries/studyroom";
import { getResourceRepository } from "@/utils/supabase/queries/resource-repository";
import { createSupabaseComponentClient } from "@/utils/supabase/clients/component";
import { ChevronRight, DoorOpen, Plus } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import router from "next/router";
import StudyRoomSidebarItem from "@/components/course/sidebar-item";

interface CourseSidebarProps {
  courseId: string;
}

export function CourseSidebar({ courseId }: CourseSidebarProps) {
  const supabase = createSupabaseComponentClient();
  const queryClient = useQueryClient();
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [joinStudyRoomDialogOpen, setJoinStudyRoomDialogOpen] = useState(false);
  const [newStudyRoomDialogOpen, setNewStudyRoomDialogOpen] = useState(false);
  const [joinStudyRoomText, setJoinStudyRoomText] = useState("");
  const [newStudyRoomText, setNewStudyRoomText] = useState("");

  // Fetch course info.
  const { data: course, isLoading, error: courseError } = useQuery({
    queryKey: ["courseInfo", courseId],
    queryFn: async () => await getCourseInfo(supabase, courseId),
  });

  // Fetch resource repository info (assumed to be one per course).
  const { data: resourceRepository } = useQuery({
    queryKey: ["resourceRepository", courseId],
    queryFn: async () => {
      if (!courseId) return null;
      return getResourceRepository(supabase, courseId);
    },
    enabled: !!courseId,
  });

  // Fetch study rooms for the current user in this course.
  const {
    data: studyRooms,
    isLoading: studyRoomsLoading,
    error: studyRoomsError,
  } = useQuery({
    queryKey: ["studyrooms", courseId],
    queryFn: async () => {
      if (!courseId) return [];
      return getStudyRooms(supabase, courseId as string);
    },
    enabled: !!courseId,
  });

  if (isLoading) {
    return <div className="ml-[170px] p-4">Loading...</div>;
  }
  if (courseError || !course) {
    return <div className="ml-[170px] p-4">Error loading course data</div>;
  }

  return (
    <Sidebar className="h-screen border-r ml-[170px]">
      <ScrollArea className="h-full">
        <SidebarContent className="pb-4">
          {/* Course Information Section */}
          <SidebarGroup>
            <SidebarHeader className="flex flex-col px-1 pt-1 pb-1 text-center text-sm font-semibold uppercase">
              {course.course_code} - {course.course_name}
            </SidebarHeader>
          </SidebarGroup>

          {/* Study Rooms Section */}
          <SidebarGroup>
            <SidebarHeader className="px-0 pt-1 pb-1">
              <div className="w-full flex items-center justify-between text-sm font-semibold text-muted-foreground uppercase">
                <span className="inline-flex items-center">Study Rooms</span>
                {/* Dropdown for joining/creating study rooms */}
                <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="p-1">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="min-w-56 rounded-lg"
                    side="right"
                    align="start"
                    sideOffset={4}
                  >
                    {/* Join Study Room Dialog */}
                    <Dialog open={joinStudyRoomDialogOpen} onOpenChange={setJoinStudyRoomDialogOpen}>
                      <DialogTrigger asChild>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.preventDefault();
                            setJoinStudyRoomDialogOpen(true);
                          }}
                        >
                          <DoorOpen className="mr-2 h-4 w-4" />
                          Join Study Room
                        </DropdownMenuItem>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px] mx-auto">
                        <DialogHeader>
                          <DialogTitle>Join Study Room</DialogTitle>
                          <DialogDescription>
                            Enter the Study Room ID you wish to join.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col gap-3 py-3">
                          <Input
                            placeholder="Enter study room ID..."
                            value={joinStudyRoomText}
                            onChange={(e) => setJoinStudyRoomText(e.target.value)}
                          />
                        </div>
                        <DialogFooter>
                          <Button
                            disabled={joinStudyRoomText.trim().length === 0}
                            onClick={async () => {
                              try {
                                const joinedStudyRoom = await joinStudyRoom(supabase, joinStudyRoomText, courseId);
                                if (joinedStudyRoom.alreadyJoined) {
                                  toast("You are already a member of this study room.");
                                } else {
                                  toast.success("Study room joined successfully.");
                                }
                                queryClient.invalidateQueries({ queryKey: ["studyrooms", courseId] });
                                setJoinStudyRoomDialogOpen(false);
                                router.push(`/course/${courseId}/studyroom/${joinedStudyRoom.id}`);
                              } catch (error: unknown) {
                                if (error instanceof Error) {
                                  toast.error(`Error joining study room: ${error.message}`);
                                } else {
                                  toast.error("An unknown error occurred while joining study room.");
                                }
                              }
                            }}
                          >
                            Join
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <DropdownMenuSeparator />
                    {/* Create Study Room Dialog */}
                    <Dialog
                      open={newStudyRoomDialogOpen}
                      onOpenChange={(isOpen) => setNewStudyRoomDialogOpen(isOpen)}
                    >
                      <DialogTrigger asChild>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.preventDefault();
                            setNewStudyRoomDialogOpen(true);
                          }}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Create Study Room
                        </DropdownMenuItem>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>New Study Room</DialogTitle>
                        </DialogHeader>
                        <div className="flex flex-col gap-3 py-3">
                          <div className="flex flex-col gap-2">
                            <Label htmlFor="new-study-room" className="text-right">
                              Study Room Name
                            </Label>
                            <Input
                              id="new-study-room"
                              value={newStudyRoomText}
                              onChange={(e) => setNewStudyRoomText(e.target.value)}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            disabled={newStudyRoomText.length < 1}
                            type="submit"
                            onClick={async () => {
                              const studyroom = await createStudyRoom(
                                supabase,
                                newStudyRoomText,
                                courseId
                              );
                              toast("Study room created.");
                              queryClient.refetchQueries({
                                queryKey: ["studyrooms", courseId],
                              });
                              setNewStudyRoomDialogOpen(false);
                              setDropdownOpen(false);
                              router.push(`/course/${courseId}/studyroom/${studyroom.id}`);
                            }}
                          >
                            Create
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </SidebarHeader>
            <SidebarGroupContent className="px-2 py-1 list-none space-y-1">
              {studyRoomsLoading ? (
                <div>Loading study rooms...</div>
              ) : studyRoomsError ? (
                <div>Error loading study rooms</div>
              ) : studyRooms && studyRooms.length > 0 ? (
                studyRooms.map((room) => (
                  <StudyRoomSidebarItem
                    key={room.id}
                    studyRoom={room}
                    selectedStudyRoomId={router.query.studyroomId as string}
                    courseId={courseId}
                  />
                ))
              ) : (
                <div>No study rooms joined yet.</div>
              )}
            </SidebarGroupContent>
          </SidebarGroup>

          <Separator />

          {/* Resource Repository Section */}
          <SidebarGroup>
            <SidebarHeader className="px-0 pt-1 pb-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-full flex items-center justify-between text-sm font-semibold text-muted-foreground uppercase"
                onClick={() => {
                  console.log("Resource Repository clicked");
                  console.log(resourceRepository);
                  console.log(resourceRepository?.id);
                  if (resourceRepository && resourceRepository.id) {
                    router.push(
                      `/course/${courseId}/resource-repository/${resourceRepository.id}`
                    );
                  } else {
                    toast.error("Resource Repository not found");
                  }
                }}
              >
                <span>Resource Repository</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </SidebarHeader>
          </SidebarGroup>

          <Separator />

          {/* Forums Section */}
          {/* !!!!!!!!!!!!!!!!!!!!!TO BE IMPLEMENTED!!!!!!!!!!!!!!!!!!!!! */}
          <SidebarGroup>
            <SidebarHeader className="px-0 pt-1 pb-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-full flex items-center justify-between text-sm font-semibold text-muted-foreground uppercase"
                onClick={() => router.push(`/course/${courseId}/forums`)}
              >
                <span>Forums</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </SidebarHeader>
          </SidebarGroup>

          <Separator />

          {/* Tutoring Section */}
          {/* !!!!!!!!!!!!!!!!!!!!!TO BE IMPLEMENTED!!!!!!!!!!!!!!!!!!!!! */}
          <SidebarGroup>
            <SidebarHeader className="px-0 pt-1 pb-1">
              <div
                className="w-full flex items-center justify-between text-sm font-semibold text-muted-foreground uppercase"
              >
                <span>Tutoring</span>
                <Button variant="ghost" size="sm" className="p-1">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </SidebarHeader>
            <Label className="px-4 text-xs text-muted-foreground">
              Press &apos;+&apos; to request a tutor
            </Label>
            <SidebarGroupContent className="px-2 py-1 list-none space-y-1">
              <p className="cursor-default">My Tutoring Request 1</p>
              <p className="cursor-default">My Tutoring Request 2</p>
              <p className="cursor-default">My Tutoring Request 3</p>
              <p className="cursor-default">My Tutoring Request 4</p>
            </SidebarGroupContent>
          </SidebarGroup>

          <Separator />

          {/* Tutoring Requests Section */}
          {/* !!!!!!!!!!!!!!!!!!!!!TO BE IMPLEMENTED!!!!!!!!!!!!!!!!!!!!! */}
          <SidebarGroup>
            <SidebarHeader className="px-0 pt-1 pb-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-full flex items-center justify-between text-sm font-semibold text-muted-foreground uppercase"
              >
                <span>Tutoring Requests</span>
              </Button>
            </SidebarHeader>
            <SidebarGroupContent className="px-2 py-1 list-none space-y-1">
              <p className="cursor-default">No requests (placeholder)</p>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </ScrollArea>
    </Sidebar>
  );
}
