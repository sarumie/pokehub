"use client";
import Image from "next/image";
import { RiStarFill, RiStarLine, RiArrowLeftLine } from "react-icons/ri";
import { useEffect, useState } from "react";
import { use } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/AuthGuard";
import Loading from "@/components/Loading";

async function getUserByUsername(username) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/users/${username}?username=true`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch user");
  }

  return res.json();
}

async function getAllSellerRatings(sellerId) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/sellers/${sellerId}/ratings/all`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch seller ratings");
  }

  return res.json();
}

function StarRating({ rating, size = 16 }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span key={i}>
        {i <= rating ? (
          <RiStarFill size={size} className="text-yellow-400" />
        ) : (
          <RiStarLine size={size} className="text-gray-300" />
        )}
      </span>
    );
  }
  return <div className="flex items-center gap-1">{stars}</div>;
}

function UserProfileContent({ params }) {
  const router = useRouter();
  const username = use(params).username;
  const [user, setUser] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleBack = () => {
    router.back();
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await getUserByUsername(username);
        setUser(userData);

        const ratingsData = await getAllSellerRatings(userData.id);
        setRatings(ratingsData.ratings || []);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [username]);

  if (loading) {
    return <Loading message="Loading user profile..." />;
  }

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div className="min-h-screen">
      <Navbar toggleSidebar={toggleSidebar} />
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="w-[1440px] mx-auto px-16 my-8">
        {/* Back button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 mb-6 text-slate-600 hover:text-slate-800 transition-colors"
        >
          <RiArrowLeftLine size={20} />
          <span>Kembali</span>
        </button>

        {/* User Profile Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 mb-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 relative rounded-full overflow-hidden">
              <Image
                src={user.profilePicture || "/api/placeholder/80/80"}
                alt={user.username}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{user.username}</h1>
              {user.fullName && (
                <p className="text-slate-600 mb-2">{user.fullName}</p>
              )}
              {user.location && (
                <p className="text-slate-500 text-sm mb-3">
                  📍 {user.location}
                </p>
              )}
              <div className="flex items-center gap-3">
                <StarRating rating={user.averageRating} size={20} />
                <span className="text-lg font-semibold">
                  {user.averageRating.toFixed(1)}
                </span>
                <span className="text-slate-600">
                  ({user.reviewCount} reviews)
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-slate-500 text-sm">Member since</p>
              <p className="font-semibold">
                {new Date(user.createdAt).toLocaleDateString("id-ID", {
                  year: "numeric",
                  month: "long",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Listings Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 mb-6">
          <h2 className="text-2xl font-bold mb-6">Barang yang Dijual</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {user.listings.map((listing) => (
              <div
                key={listing.id}
                className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/item/${listing.id}`)}
              >
                <div className="aspect-square relative rounded-lg overflow-hidden mb-3">
                  <Image
                    src={listing.pictUrl}
                    alt={listing.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="font-semibold mb-2 line-clamp-2">
                  {listing.name}
                </h3>
                <p className="text-lg font-bold text-blue-600">
                  Rp {listing.price.toLocaleString("id-ID")}
                </p>
                <p className="text-sm text-slate-500">Stok: {listing.stock}</p>
              </div>
            ))}
          </div>
          {user.listings.length === 0 && (
            <p className="text-slate-500 text-center py-8">
              Belum ada barang yang dijual
            </p>
          )}
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8">
          <h2 className="text-2xl font-bold mb-6">
            Semua Review ({ratings.length})
          </h2>

          {ratings.length > 0 ? (
            <div className="space-y-6">
              {ratings.map((rating) => (
                <div
                  key={rating.id}
                  className="border-b border-slate-100 last:border-b-0 pb-6 last:pb-0"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 relative rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src={rating.reviewerAvatar}
                        alt={rating.reviewerName}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold">{rating.reviewerName}</h4>
                        <StarRating rating={rating.rating} size={16} />
                        <span className="text-sm text-slate-500">
                          {rating.timeAgo}
                        </span>
                      </div>
                      {rating.listingName && (
                        <p className="text-sm text-slate-600 mb-2">
                          Review untuk:{" "}
                          <span className="font-medium">
                            {rating.listingName}
                          </span>
                        </p>
                      )}
                      <p className="text-slate-700 leading-relaxed">
                        {rating.comment}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-8">Belum ada review</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function UserProfilePage({ params }) {
  return (
    <ProtectedRoute>
      <UserProfileContent params={params} />
    </ProtectedRoute>
  );
}
