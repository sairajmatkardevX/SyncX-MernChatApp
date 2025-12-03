import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { server } from "../../constants/config";
import { userNotExists } from "../../redux/reducers/auth";
import {
  setIsMobile,
  setIsNewGroup,
  setIsNotification,
  setIsSearch,
} from "../../redux/reducers/misc";
import { resetNotificationCount } from "../../redux/reducers/chat";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";
import { Suspense, lazy } from "react";
import { useGetNotificationsQuery } from "../../redux/api/api";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  Search,
  Plus,
  Users,
  Bell,
  LogOut,
  Menu,
  Sun,
  Moon,
  Settings,
} from "lucide-react";

const SearchDialog = lazy(() => import("../specific/Search"));
const NotificationDialog = lazy(() => import("../specific/Notifications"));
const NewGroupDialog = lazy(() => import("../specific/NewGroup"));

const DialogFallback = ({ message }) => (
  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
    <div className="bg-background rounded-lg p-6 shadow-lg flex items-center space-x-3">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      <span>{message}</span>
    </div>
  </div>
);

const IconButton = ({ icon, label, onClick, shortcut }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClick}
          aria-label={shortcut ? `${label} (${shortcut})` : label}
          className="text-foreground hover:bg-accent hover:text-accent-foreground"
        >
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{shortcut ? `${label} (${shortcut})` : label}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  const { isSearch, isNotification, isNewGroup } = useSelector(
    (state) => state.misc
  );
  const { user } = useSelector((state) => state.auth);

  const { data: notificationsData } = useGetNotificationsQuery();
  const notificationCount = notificationsData?.allRequests?.length || 0;

  const handleMobile = useCallback(
    () => dispatch(setIsMobile(true)),
    [dispatch]
  );
  const openSearch = useCallback(() => dispatch(setIsSearch(true)), [dispatch]);
  const openNewGroup = useCallback(
    () => dispatch(setIsNewGroup(true)),
    [dispatch]
  );
  const openNotification = useCallback(() => {
    dispatch(setIsNotification(true));
    dispatch(resetNotificationCount());
  }, [dispatch]);
  const navigateToGroup = useCallback(() => navigate("/groups"), [navigate]);
  const navigateToHome = useCallback(() => navigate("/"), [navigate]);
  const navigateToProfile = useCallback(() => navigate("/profile"), [navigate]);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    
  
   
  }, [theme, setTheme]);

  const logoutHandler = async () => {
    try {
      const { data } = await axios.get(`${server}/api/v1/user/logout`, {
        withCredentials: true,
      });
      dispatch(userNotExists());
      toast({
        title: "Logged out successfully",
        description: data.message,
      });
    } catch (error) {
      toast({
        title: "Logout failed",
        description: error?.response?.data?.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        openSearch();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault();
        openNewGroup();
      }
      
      if ((e.ctrlKey || e.metaKey) && e.key === "t") {
        e.preventDefault();
        toggleTheme();
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [openSearch, openNewGroup, toggleTheme]);

  return (
    <>
      <header className="bg-background border-b border-border sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Mobile Menu */}
            <div className="flex items-center space-x-3">
              {/* Mobile Menu Button */}
              <Button
                onClick={handleMobile}
                className="md:hidden"
                variant="ghost"
                size="icon"
                aria-label="Open mobile menu"
              >
                <Menu className="h-5 w-5" />
              </Button>

              {/* Logo */}
              <div
                onClick={navigateToHome}
                className="flex items-center space-x-3 cursor-pointer group"
              >
                <div className="relative">
                  <img
                    src="/syncxlogo.png"
                    alt="SyncX Logo"
                    className="w-12 h-12 object-contain group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextElementSibling.style.display = "flex";
                    }}
                  />
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl hidden items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                    <div className="text-white font-bold text-xl tracking-tight">
                      S
                    </div>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 border-2 border-background rounded-full"></div>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold tracking-tight text-foreground">
                    SyncX
                  </h1>
                  <p className="text-xs text-muted-foreground leading-tight">
                    Seamless Communication
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-1">
              {/* Theme Toggle */}
              <IconButton
                icon={
                  <>
                    <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  </>
                }
                label="Toggle theme"
                shortcut="Ctrl+T"
                onClick={toggleTheme}
              />

              {/* Search */}
              <IconButton
                icon={<Search className="h-5 w-5" />}
                label="Search"
                shortcut="Ctrl+K"
                onClick={openSearch}
              />

              {/* New Group */}
              <IconButton
                icon={<Plus className="h-5 w-5" />}
                label="New Group"
                shortcut="Ctrl+N"
                onClick={openNewGroup}
              />

              {/* Manage Groups */}
              <IconButton
                icon={<Users className="h-5 w-5" />}
                label="Manage Groups"
                onClick={navigateToGroup}
              />

              {/* Notifications  */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={openNotification}
                      className="relative"
                      aria-label={`Open notifications${
                        notificationCount > 0
                          ? ` (${notificationCount} new)`
                          : ""
                      }`}
                    >
                      <Bell className="h-5 w-5" />
                      {/*  Live notification badge */}
                      {notificationCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 px-1.5 min-w-[1.25rem] h-5 flex items-center justify-center text-[10px] font-bold bg-destructive text-destructive-foreground border-2 border-background animate-pulse">
                          {notificationCount > 9 ? "9+" : notificationCount}
                        </Badge>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Notifications
                      {notificationCount > 0 && (
                        <span className="ml-1 text-destructive font-semibold">
                          ({notificationCount})
                        </span>
                      )}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Settings Dropdown - All Screens */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Settings menu"
                  >
                    <Settings className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={navigateToProfile}
                    className="flex items-center gap-2 p-3 cursor-pointer"
                  >
                    <Users className="h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logoutHandler}
                    className="flex items-center gap-2 p-3 cursor-pointer text-destructive hover:text-destructive focus:text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Lazy-loaded dialogs */}
      {isSearch && (
        <Suspense fallback={<DialogFallback message="Loading search..." />}>
          <SearchDialog />
        </Suspense>
      )}
      {isNotification && (
        <Suspense
          fallback={<DialogFallback message="Loading notifications..." />}
        >
          <NotificationDialog />
        </Suspense>
      )}
      {isNewGroup && (
        <Suspense fallback={<DialogFallback message="Creating new group..." />}>
          <NewGroupDialog />
        </Suspense>
      )}
    </>
  );
};

export default Header;