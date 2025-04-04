import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  TicketCheck,
  FileText,
  Bot,
  ChartBar,
  Settings,
  LogOut,
  Server,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";

export function Sidebar() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  if (isMobile && !sidebarOpen) {
    return null;
  }

  return (
    <aside className={`${isMobile ? "absolute left-0 top-0 z-40 h-full" : "hidden md:flex"} w-64 flex-col bg-white border-r border-gray-200 shadow-sm`}>
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-semibold flex items-center text-primary">
          <Server className="mr-2 h-5 w-5" />
          IT Support AIOps
        </h1>
      </div>
      
      {/* User info */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center">
            <span className="font-medium text-sm">
              {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
            </span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}</p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        <NavLink href="/" icon={<LayoutDashboard className="w-5 h-5" />} isActive={location === "/"}>
          Dashboard
        </NavLink>
        <NavLink href="/tickets" icon={<TicketCheck className="w-5 h-5" />} isActive={location === "/tickets"}>
          Tickets
        </NavLink>
        <NavLink href="/logs" icon={<FileText className="w-5 h-5" />} isActive={location === "/logs"}>
          Log Analyzer
        </NavLink>
        <NavLink href="/chat" icon={<Bot className="w-5 h-5" />} isActive={location === "/chat"}>
          AI Assistant
        </NavLink>
        <NavLink href="/analytics" icon={<ChartBar className="w-5 h-5" />} isActive={location === "/analytics"}>
          Analytics
        </NavLink>
        <NavLink href="/settings" icon={<Settings className="w-5 h-5" />} isActive={location === "/settings"}>
          Settings
        </NavLink>
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
        >
          <LogOut className="w-5 h-5 mr-3" />
          {logoutMutation.isPending ? "Logging out..." : "Logout"}
        </Button>
      </div>
    </aside>
  );
}

interface NavLinkProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isActive: boolean;
}

function NavLink({ href, icon, children, isActive }: NavLinkProps) {
  return (
    <Link href={href}>
      <a className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
        isActive 
          ? "border-l-4 border-primary bg-blue-50 text-primary" 
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      }`}>
        <span className={`mr-3 transition-transform ${isActive ? "text-primary scale-110" : ""}`}>{icon}</span>
        <span className={isActive ? "font-semibold" : ""}>{children}</span>
        {href === "/chat" && (
          <span className="ml-2 h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
        )}
      </a>
    </Link>
  );
}
