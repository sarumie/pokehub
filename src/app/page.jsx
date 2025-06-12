"use client";
import { redirect } from "next/navigation";

export default function Home() {
  const isLoggedIn = sessionStorage.getItem("userId");
  if (isLoggedIn) {
    redirect("/home");
  } else {
    redirect("/login");
  }
}
