"use client";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Loading from "@/components/Loading";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push("/home");
      } else {
        router.push("/login");
      }
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading while checking auth
  return <Loading message="Authenticating..." />;
}
