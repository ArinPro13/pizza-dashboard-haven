
import React from "react";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="max-w-md text-center px-4">
        <h1 className="text-6xl font-bold mb-6 text-primary">404</h1>
        <p className="text-xl mb-8">
          Oops! The page you're looking for doesn't exist.
        </p>
        <Link to="/">
          <Button size="lg" className="animate-pulse">
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
