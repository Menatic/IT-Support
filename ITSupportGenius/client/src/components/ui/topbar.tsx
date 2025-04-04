import { useState } from "react";
import { Menu, Bell, HelpCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

export function Topbar() {
  const [notifications, setNotifications] = useState([
    { id: 1, title: "New high-priority ticket", time: "10 minutes ago" },
    { id: 2, title: "Database server warning", time: "30 minutes ago" },
    { id: 3, title: "Ticket #2547 updated", time: "1 hour ago" },
  ]);

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        <div className="flex items-center md:hidden">
          <Button variant="ghost" size="icon">
            <Menu className="h-6 w-6 text-gray-500" />
          </Button>
        </div>
        
        <div className="ml-4 flex-1">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="text-gray-400 h-4 w-4" />
            </div>
            <Input
              type="text"
              className="pl-10 pr-3 py-2 border border-gray-300 rounded-md"
              placeholder="Search tickets, logs..."
            />
          </div>
        </div>
        
        <div className="ml-4 flex items-center md:ml-6">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-6 w-6 text-gray-400" />
                <span className="absolute top-1 right-1 block h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                  {notifications.length}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="p-2 font-medium text-sm">Notifications</div>
              {notifications.map((notification) => (
                <DropdownMenuItem key={notification.id} className="p-3 cursor-pointer flex flex-col items-start">
                  <div className="font-medium text-sm">{notification.title}</div>
                  <div className="text-xs text-gray-500 mt-1">{notification.time}</div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Help */}
          <Button variant="ghost" size="icon" className="ml-3">
            <HelpCircle className="h-6 w-6 text-gray-400" />
          </Button>
        </div>
      </div>
    </header>
  );
}
