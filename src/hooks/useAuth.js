"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const router = useRouter();

  const verifyUser = async (id) => {
    try {
      const response = await fetch(`/api/profile?userId=${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          // User not found in database
          sessionStorage.removeItem("userId");
          setIsAuthenticated(false);
          setUserId(null);
          router.push("/login");
          return false;
        }
        throw new Error("Failed to verify user");
      }
      return true;
    } catch (error) {
      console.error("Error verifying user:", error);
      return false;
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUserId = sessionStorage.getItem("userId");
        if (storedUserId) {
          const isValid = await verifyUser(storedUserId);
          if (isValid) {
            setIsAuthenticated(true);
            setUserId(storedUserId);
          }
        } else {
          setIsAuthenticated(false);
          setUserId(null);
        }
      } catch (error) {
        // Handle case where sessionStorage is not available (SSR)
        setIsAuthenticated(false);
        setUserId(null);
      }
      setIsLoading(false);
    };

    checkAuth();

    // Listen for storage changes (e.g., login/logout in another tab)
    const handleStorageChange = (e) => {
      if (e.key === "userId") {
        checkAuth();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const login = (userIdValue) => {
    sessionStorage.setItem("userId", userIdValue);
    setIsAuthenticated(true);
    setUserId(userIdValue);
  };

  const logout = () => {
    sessionStorage.removeItem("userId");
    setIsAuthenticated(false);
    setUserId(null);
    router.push("/login");
  };

  const requireAuth = () => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
      return false;
    }
    return true;
  };

  const requireGuest = () => {
    if (!isLoading && isAuthenticated) {
      router.push("/home");
      return false;
    }
    return true;
  };

  return {
    isAuthenticated,
    isLoading,
    userId,
    login,
    logout,
    requireAuth,
    requireGuest,
  };
};
