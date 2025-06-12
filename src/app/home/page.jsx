"use client";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import NewsCarousel from "@/components/home/NewsCarousel";
import TrendingItems from "@/components/home/TrendingItems";
import RecentBoosterPack from "@/components/home/RecentBoosterPack";
import Footer from "@/components/Footer";
import { useState } from "react";

const HomePage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen">
      <Navbar toggleSidebar={toggleSidebar} />
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="max-w-[1440px] mx-auto space-y-6 mt-6">
        <NewsCarousel />
        <TrendingItems />
        <RecentBoosterPack />
      </div>
      <Footer />
    </div>
  );
};

export default HomePage;
