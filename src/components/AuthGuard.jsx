"use client";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import Loading from "@/components/Loading";

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
    return <Loading message="Verifying access..." />;
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
    return <Loading message="Redirecting..." />;
  }

  return children;
};
