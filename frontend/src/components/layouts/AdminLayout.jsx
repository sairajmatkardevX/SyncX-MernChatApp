
import { useState } from "react";
import { Link as LinkComponent, Navigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { adminLogout } from "../../redux/thunks/admin";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import {
  LayoutDashboard,
  Users,
  MessageSquare,
  MessagesSquare,
  LogOut,
  Menu,
  X,
  Shield,
  Sun,
  Moon,
  Settings,
  Activity,
  Bell,
} from "lucide-react";

const adminTabs = [
  {
    name: "Dashboard",
    path: "/admin/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
    badge: null,
  },
  {
    name: "Users",
    path: "/admin/users",
    icon: <Users className="h-5 w-5" />,
    badge: null,
  },
  {
    name: "Chats",
    path: "/admin/chats",
    icon: <MessageSquare className="h-5 w-5" />,
    badge: null,
  },
  {
    name: "Messages",
    path: "/admin/messages",
    icon: <MessagesSquare className="h-5 w-5" />,
    badge: null,
  },
];

const Sidebar = ({ className = "", onNavigate }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { theme, setTheme } = useTheme();

  const logoutHandler = () => {
    dispatch(adminLogout());
  };

  return (
    <div className={`flex flex-col h-full bg-sidebar text-sidebar-foreground ${className}`}>
      <div className="p-6 pb-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="relative">
            <img
              src="/syncxlogo.png"
              alt="SyncX Admin"
              className="w-12 h-12 object-contain"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextElementSibling.style.display = "flex";
              }}
            />
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl hidden items-center justify-center shadow-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-sidebar-foreground">SyncX</h1>
            <Badge variant="secondary" className="bg-primary/10 text-primary border border-primary/20 text-xs mt-1">
              <Shield className="h-3 w-3 mr-1" />
              Admin Panel
            </Badge>
          </div>
        </div>
        <Separator className="bg-border" />
      </div>

      <nav className="px-4 space-y-1 flex-1 overflow-y-auto">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">
          Menu
        </p>
        {adminTabs.map((tab) => {
          const isActive = location.pathname === tab.path;

          return (
            <Button
              key={tab.path}
              asChild
              variant={isActive ? "secondary" : "ghost"}
              className={`w-full justify-start space-x-3 h-11 transition-all ${
                isActive
                  ? "bg-primary/10 text-primary hover:bg-primary/15 border border-primary/20 shadow-sm"
                  : "text-sidebar-foreground hover:text-foreground hover:bg-accent"
              }`}
              onClick={onNavigate}
            >
              <LinkComponent to={tab.path}>
                {tab.icon}
                <span className="font-medium">{tab.name}</span>
                {tab.badge && (
                  <Badge variant="secondary" className="ml-auto">
                    {tab.badge}
                  </Badge>
                )}
              </LinkComponent>
            </Button>
          );
        })}
      </nav>

      <div className="p-4 space-y-2 border-t border-border">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50">
          <Activity className="h-4 w-4 text-green-500 animate-pulse" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground">System Status</p>
            <p className="text-xs text-muted-foreground">All services operational</p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start space-x-3 h-11 text-sidebar-foreground hover:text-foreground hover:bg-accent"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute left-3 h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="font-medium">
                {theme === "light" ? "Light" : theme === "dark" ? "Dark" : "System"}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuLabel>Theme</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setTheme("light")}>
              <Sun className="mr-2 h-4 w-4" />
              <span>Light</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              <Moon className="mr-2 h-4 w-4" />
              <span>Dark</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              <Settings className="mr-2 h-4 w-4" />
              <span>System</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          onClick={logoutHandler}
          variant="ghost"
          className="w-full justify-start space-x-3 h-11 text-sidebar-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Logout</span>
        </Button>
      </div>
    </div>
  );
};

const AdminLayout = ({ children }) => {
  const { isAdmin } = useSelector((state) => state.auth);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { setTheme } = useTheme();

  const handleMobileToggle = () => setIsMobileOpen(!isMobileOpen);
  const handleMobileNavigate = () => setIsMobileOpen(false);

  if (!isAdmin) return <Navigate to="/admin" />;

  return (
    <div className="flex h-screen bg-background">
      <div className="hidden md:flex w-80 flex-shrink-0 bg-sidebar border-r border-border">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="md:hidden flex items-center justify-between px-4 h-16 bg-card border-b border-border shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src="/logo.png"
                alt="SyncX"
                className="w-10 h-10 object-contain"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextElementSibling.style.display = "flex";
                }}
              />
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg hidden items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-lg font-bold text-card-foreground">SyncX</h1>
              <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                Admin
              </Badge>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              className="text-card-foreground hover:text-foreground relative"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-card-foreground hover:text-foreground"
                >
                  <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Theme</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  <Sun className="mr-2 h-4 w-4" />
                  <span>Light</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  <Moon className="mr-2 h-4 w-4" />
                  <span>Dark</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>System</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleMobileToggle}
              className="text-card-foreground hover:text-foreground"
            >
              {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-4 md:p-8 max-w-7xl">
            {children}
          </div>
        </main>
      </div>

      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetContent side="left" className="w-80 p-0 bg-sidebar border-r border-border">
          <Sidebar className="h-full" onNavigate={handleMobileNavigate} />
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AdminLayout;