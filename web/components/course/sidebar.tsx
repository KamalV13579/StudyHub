import { ChevronDown } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";

export function CourseSidebar() {
  return (
    // THESE ARE ALL PLACEHOLDERS FOR NOW, REAL IMPLEMENTATION WILL BE DONE LATER
    <Sidebar className="h-screen border-r">
      <ScrollArea className="h-full">
        <SidebarContent className="pb-4">
          {/* Study Rooms Section */}
          <SidebarGroup>
            <SidebarHeader className="px-4 pt-3 pb-1 text-sm font-semibold uppercase">
              Study Rooms
            </SidebarHeader>
            <SidebarGroupContent className="px-2 py-1 list-none space-y-1">
              {/* Each collapsible here represents a study room category */}
              <Collapsible>
                <CollapsibleTrigger className="flex items-center justify-between px-2 py-1 hover:bg-accent rounded cursor-pointer text-sm">
                  <span>General Discussion</span>
                  <ChevronDown className="transition-transform duration-200 data-[state=closed]:-rotate-90 data-[state=open]:rotate-0" />
                </CollapsibleTrigger>
                <CollapsibleContent className="px-4 py-1 text-sm text-muted-foreground">
                  <div className="py-0.5">Room A (placeholder)</div>
                  <div className="py-0.5">Room B (placeholder)</div>
                  <div className="py-0.5">Room C (placeholder)</div>
                </CollapsibleContent>
              </Collapsible>
              <Collapsible>
                <CollapsibleTrigger className="flex items-center justify-between px-2 py-1 hover:bg-accent rounded cursor-pointer text-sm">
                  <span>Homework Help</span>
                  <ChevronDown className="transition-transform duration-200 data-[state=closed]:-rotate-90 data-[state=open]:rotate-0" />
                </CollapsibleTrigger>
                <CollapsibleContent className="px-4 py-1 text-sm text-muted-foreground">
                  <div className="py-0.5">Room D (placeholder)</div>
                  <div className="py-0.5">Room E (placeholder)</div>
                </CollapsibleContent>
              </Collapsible>
            </SidebarGroupContent>
          </SidebarGroup>

          <Separator />

          {/* Resource Repository Section */}
          <SidebarGroup>
            <SidebarHeader className="px-4 pt-3 pb-1 text-sm font-semibold uppercase">
              Resource Repository
            </SidebarHeader>
            <SidebarGroupContent className="px-2 py-1 text-sm text-foreground list-none">
              <p className="cursor-default">Resources (placeholder)</p>
            </SidebarGroupContent>
          </SidebarGroup>

          <Separator />

          {/* Tutoring Section */}
          <SidebarGroup>
            <SidebarHeader className="px-4 pt-3 pb-1 text-sm font-semibold uppercase">
              Tutoring
            </SidebarHeader>
            <SidebarGroupContent className="px-2 py-1 text-sm text-muted-foreground list-none">
              <p className="cursor-default">Tutoring info (placeholder)</p>
            </SidebarGroupContent>
          </SidebarGroup>

          <Separator />

          {/* Tutoring Requests Section */}
          <SidebarGroup>
            <SidebarHeader className="px-4 pt-3 pb-1 text-sm font-semibold uppercase">
              Tutoring Requests
            </SidebarHeader>
            <SidebarGroupContent className="px-2 py-1 text-sm text-muted-foreground list-none">
              <p className="cursor-default">No requests (placeholder)</p>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </ScrollArea>
    </Sidebar>
  );
}
