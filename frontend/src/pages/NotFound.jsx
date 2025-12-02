import { Link } from "react-router-dom";

import { AlertTriangle, Home } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 dark:from-gray-900 dark:to-purple-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardContent className="p-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-400" />
              </div>
              <div className="absolute -top-2 -right-2 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  404
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Page Not Found
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Oops! The page you're looking for doesn't exist.
            </p>
          </div>

          {/* Action Button */}
          <Button
            asChild
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Link to="/" className="flex items-center justify-center gap-2">
              <Home className="h-4 w-4" />
              Go back to home
            </Link>
          </Button>

          {/* Decorative Elements */}
          <div className="flex justify-center space-x-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-blue-300 dark:bg-blue-600 rounded-full animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
