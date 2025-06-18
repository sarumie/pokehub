"use client";
import { useState, useEffect, Suspense } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import ListingCard from "@/components/discover/ListingCard";
import { useSearchParams } from "next/navigation";
import { ProtectedRoute } from "@/components/AuthGuard";
import Loading from "@/components/Loading";

function SearchResults() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q") || "";

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/listings/search?q=${searchQuery}`);
        const data = await response.json();
        if (data.length > 0) {
          setListings(data);
        } else {
          setListings([]);
        }
      } catch (error) {
        console.error("Error fetching listings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [searchQuery]);

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-8">
      {loading ? (
        <Loading fullScreen={false} message="Searching listings..." />
      ) : listings.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-800">
            No listings found
          </h2>
          <p className="text-gray-600 mt-2">Try adjusting your search query</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}

function DiscoverContent() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen">
      <Navbar toggleSidebar={toggleSidebar} />
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <Suspense
        fallback={
          <div className="max-w-[1440px] mx-auto px-6 py-8">
            <Loading fullScreen={false} message="Loading discover..." />
          </div>
        }
      >
        <SearchResults />
      </Suspense>
    </div>
  );
}

export default function Discover() {
  return (
    <ProtectedRoute>
      <DiscoverContent />
    </ProtectedRoute>
  );
}
