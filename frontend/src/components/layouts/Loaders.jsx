import { Skeleton } from "@/components/ui/skeleton";

const LayoutLoader = () => {
  return (
    <div className="flex h-screen w-screen bg-background">
      {/* Left Sidebar Skeleton - Hidden on mobile, uses theme colors */}
      <div className="hidden sm:block w-1/3 md:w-1/4 h-full bg-sidebar border-r border-border">
        <div className="p-4 space-y-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full bg-background/80" />
          ))}
        </div>
      </div>
      
      {/* Main Content Skeleton */}
      <div className="w-full sm:w-2/3 md:w-5/12 lg:w-1/2 h-full p-4 bg-background">
        <div className="space-y-4">
          {Array.from({ length: 10 }).map((_, index) => (
            <Skeleton key={index} className="h-20 w-full rounded-lg bg-muted" />
          ))}
        </div>
      </div>

      {/* Right Sidebar Skeleton - Hidden on mobile/tablet */}
      <div className="hidden md:block w-1/3 lg:w-1/4 h-full bg-sidebar border-l border-border">
        <div className="p-6 space-y-4">
          <Skeleton className="h-48 w-48 rounded-full mx-auto bg-background/80" />
          <div className="space-y-3">
            <Skeleton className="h-12 w-full bg-background/80" />
            <Skeleton className="h-12 w-full bg-background/80" />
            <Skeleton className="h-12 w-full bg-background/80" />
            <Skeleton className="h-12 w-full bg-background/80" />
          </div>
        </div>
      </div>
    </div>
  );
};

const TypingLoader = () => {
  return (
    <div className="flex justify-center items-center space-x-2 p-2">
      {[0.1, 0.2, 0.3].map((delay, index) => (
        <div
          key={index}
          className="w-4 h-4 bg-primary/60 rounded-full animate-bounce"
          style={{
            animationDelay: `${delay}s`,
          }}
        />
      ))}
    </div>
  );
};

const MessageLoader = () => {
  return (
    <div className="flex space-x-3 p-4 animate-pulse">
      <Skeleton className="h-10 w-10 rounded-full bg-muted" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-1/4 bg-muted" />
        <Skeleton className="h-16 w-full rounded-lg bg-muted" />
      </div>
    </div>
  );
};

const ChatItemLoader = () => {
  return (
    <div className="flex items-center space-x-3 p-4 animate-pulse border-b border-border">
      <Skeleton className="h-12 w-12 rounded-full bg-muted" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-1/3 bg-muted" />
        <Skeleton className="h-3 w-2/3 bg-muted" />
      </div>
    </div>
  );
};

const ButtonLoader = () => {
  return (
    <div className="flex items-center justify-center gap-2">
      <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      <span>Loading...</span>
    </div>
  );
};

const ProfileLoader = () => {
  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-md mx-auto animate-pulse">
      <Skeleton className="h-48 w-48 rounded-full bg-muted" />
      <div className="w-full space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-16 w-full rounded-lg bg-muted" />
        ))}
      </div>
    </div>
  );
};

const AdminDashboardLoader = () => {
  return (
    <div className="space-y-6 p-6 bg-background">
      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-32 w-full rounded-lg bg-muted" />
        ))}
      </div>
      
      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-80 w-full rounded-lg bg-muted" />
        <Skeleton className="h-80 w-full rounded-lg bg-muted" />
      </div>
      
      {/* Table Skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-12 w-full rounded-lg bg-muted" />
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-16 w-full rounded-lg bg-muted" />
        ))}
      </div>
    </div>
  );
};

const PageLoader = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-4">
        <div className="relative w-16 h-16 mx-auto">
          <div className="absolute inset-0 border-4 border-primary/30 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
};

const SidebarLoader = () => {
  return (
    <div className="p-4 space-y-4 bg-sidebar h-full">
      {/* Header Skeleton */}
      <div className="flex items-center space-x-3 pb-4 border-b border-border">
        <Skeleton className="h-12 w-12 rounded-full bg-background/80" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-2/3 bg-background/80" />
          <Skeleton className="h-3 w-1/3 bg-background/80" />
        </div>
      </div>
      
      {/* Menu Items Skeleton */}
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton key={index} className="h-11 w-full rounded-lg bg-background/80" />
      ))}
    </div>
  );
};

export { 
  TypingLoader, 
  LayoutLoader, 
  MessageLoader, 
  ChatItemLoader, 
  ButtonLoader,
  ProfileLoader,
  AdminDashboardLoader,
  PageLoader,
  SidebarLoader
};