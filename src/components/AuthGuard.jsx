"use client";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

// Guard for protected routes (requires authentication)
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, requireAuth } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      requireAuth();
    }
  }, [isAuthenticated, isLoading, requireAuth]);

  // Show loading or nothing while checking auth
  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return children;
};

// Guard for public routes (redirects to home if authenticated)
export const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading, requireGuest } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      requireGuest();
    }
  }, [isAuthenticated, isLoading, requireGuest]);

  // Show loading or nothing while checking auth
  if (isLoading || isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return children;
};
