import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import { ModeToggle } from "@/common/ThemeToggle";

export const SidebarHeader = () => {
  return (
    <div className="flex justify-between items-center p-3 bg-card border-b">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src="https://api.dicebear.com/8.x/initials/svg?seed=Admin" alt="Admin" />
          <AvatarFallback>A</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-semibold text-sm">Admin</span>
          <span className="text-xs text-muted-foreground">Online</span>
        </div>
      </div>
      
      <div className="flex items-center gap-1">
        <ModeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>New group</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};