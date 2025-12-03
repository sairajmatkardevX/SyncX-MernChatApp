import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeProvider({ children, ...props }) {
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render children until mounted to prevent flash
  if (!mounted) {
    // Return a basic div with theme classes already applied from blocking script
    return (
      <div className="min-h-screen bg-background">
        {/* Empty during SSR/initial load - theme already applied via blocking script */}
      </div>
    );
  }

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false} // Enable smooth transitions
      storageKey="theme"
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}