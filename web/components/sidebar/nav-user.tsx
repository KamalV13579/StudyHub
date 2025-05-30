import {
  ChevronsUpDown,
  Edit,
  ImageUp,
  LogOut,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ProfileAvatar from "../profile/profile-avatar";
import { useEffect, useRef, useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  changeProfileDisplayName,
  changeProfileImage,
  getProfile,
} from "@/utils/supabase/queries/profile";
import { broadcastUserChange } from "@/utils/supabase/realtime/broadcasts";
import { useRouter } from "next/router";
import { User } from "@supabase/supabase-js";
import { useSupabase } from "@/lib/supabase";
import { useTheme } from "next-themes";

type NavUserProps = {
  user: User;
};

export function NavUser({ user }: NavUserProps) {
  const queryUtils = useQueryClient();
  const router = useRouter();
  const { isMobile } = useSidebar();
  const supabase = useSupabase();
  const { theme, setTheme } = useTheme();

  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renameText, setRenameText] = useState("");

  const { data: profile } = useQuery({
    queryKey: ["profile", user.id],
    queryFn: () => getProfile(supabase, user.id),
  });

  useEffect(() => {
    setRenameText(profile?.name ?? "");
  }, [profile]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Function to get the theme icon
  const getThemeIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="size-4 mr-2" />;
      case "dark":
        return <Moon className="size-4 mr-2" />;
      default:
        return <Monitor className="size-4 mr-2" />;
    }
  };

  // Function to handle theme change
  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    toast(
      `${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} theme applied`,
    );
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <ProfileAvatar profile={profile} />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{profile?.name}</span>
                <span className="truncate text-xs">@{profile?.handle}</span>
              </div>
              <ChevronsUpDown className="size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <ProfileAvatar profile={profile} />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{profile?.name}</span>
                  <span className="truncate text-xs">@{profile?.handle}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {/* Rename Dialog and other controls */}
            <Dialog
              open={renameDialogOpen}
              onOpenChange={(isOpen) => setRenameDialogOpen(isOpen)}
            >
              <DialogTrigger asChild>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.preventDefault();
                    setRenameDialogOpen(true);
                  }}
                >
                  <Edit />
                  Change Display Name
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Display Name</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-3 py-3">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="name" className="text-right">
                      Display Name
                    </Label>
                    <Input
                      id="name"
                      value={renameText}
                      onChange={(e) => setRenameText(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    disabled={renameText.length < 1}
                    type="submit"
                    onClick={async () => {
                      await changeProfileDisplayName(
                        supabase,
                        renameText,
                        user.id,
                      );
                      broadcastUserChange(supabase);
                      toast("Display name changed.");
                      queryUtils.refetchQueries({ queryKey: ["profile"] });
                      queryUtils.refetchQueries({ queryKey: ["members"] });
                      setRenameDialogOpen(false);
                    }}
                  >
                    Save
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <DropdownMenuItem
              onClick={() => {
                if (fileInputRef && fileInputRef.current)
                  fileInputRef.current.click();
              }}
            >
              <ImageUp />
              Change Profile Image
            </DropdownMenuItem>

            {/* Theme Selector */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                {getThemeIcon()}
                Appearance
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuRadioGroup
                  value={theme}
                  onValueChange={handleThemeChange}
                >
                  <DropdownMenuRadioItem value="light">
                    <Sun className="size-4 mr-2" />
                    Light
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="dark">
                    <Moon className="size-4 mr-2" />
                    Dark
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="system">
                    <Monitor className="size-4 mr-2" />
                    System
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={async () => {
                const { error } = await supabase.auth.signOut();
                if (error) {
                  toast("Error logging out.", { description: error.message });
                }
                router.push("/");
              }}
            >
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
      <Input
        className="hidden"
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={async (e) => {
          const file =
            (e.target.files ?? []).length > 0 ? e.target.files![0] : null;
          if (file) {
            await changeProfileImage(supabase, file, user.id);
            broadcastUserChange(supabase);
            toast("Profile image changed.", {
              description:
                "It may take a few minutes for the image to process.",
            });
            queryUtils.refetchQueries({ queryKey: ["profile"] });
            queryUtils.refetchQueries({ queryKey: ["members"] });
          }
        }}
      />
    </SidebarMenu>
  );
}
