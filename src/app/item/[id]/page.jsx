"use client";
import Image from "next/image";
import { formatPrice } from "@/utils/priceFormat";
import {
  RiAddLine,
  RiSubtractLine,
  RiShoppingCartLine,
  RiStarFill,
  RiStarLine,
} from "react-icons/ri";
import { useEffect, useState } from "react";
import { use } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/AuthGuard";
import Loading from "@/components/Loading";

async function getListing(id) {
  const res = await fetch(`/api/listings/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch listing");
  }

  return res.json();
}

async function getSellerRating(sellerId) {
  try {
    const res = await fetch(`/api/sellers/${sellerId}/ratings`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch seller ratings");
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching seller ratings:", error);
    // Return fallback data if API fails
    return {
      seller: {
        id: sellerId,
        username: "Unknown Seller",
        profilePicture: "/api/placeholder/40/40",
        overallRating: 0,
        totalReviews: 0,
      },
      recentReviews: [],
    };
  }
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

function ItemPageContent({ params }) {
  const router = useRouter();
  const id = use(params).id;
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [sellerRating, setSellerRating] = useState(null);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleIncrement = () => {
    if (quantity < listing.stock) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleAddToCart = async () => {
    try {
      setIsAddingToCart(true);
      const userId = sessionStorage.getItem("userId");

      if (!userId) {
        router.push("/login");
        return;
      }

      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          listingId: id,
          quantity,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add to cart");
      }

      // Show success message or redirect to cart
      router.push("/checkout");
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add item to cart. Please try again.");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleSeeAllReviews = () => {
    router.push(`/u/${sellerRating?.seller?.username}`);
  };

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const data = await getListing(id);
        setListing(data);

        // Fetch seller rating data
        const ratingData = await getSellerRating(data.idSeller);
        setSellerRating(ratingData);
      } catch (error) {
        console.error("Error fetching listing:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  if (loading) {
    return <Loading message="Loading item details..." />;
  }

  if (!listing) {
    return <div>Listing not found</div>;
  }

  return (
    <div className="min-h-screen">
      <Navbar toggleSidebar={toggleSidebar} />
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="w-[1440px] mx-auto px-16 my-8">
        <div className="flex gap-4">
          {/* Image Container */}
          <div className="w-[400px] h-[470px] relative">
            <Image
              src={listing.pictUrl}
              alt={listing.name}
              fill
              className="object-contain rounded-2xl"
            />
          </div>

          {/* Content Container */}
          <div className="flex-1 flex flex-col gap-4">
            <h1 className="text-4xl font-bold">{listing.name}</h1>

            <div className="flex gap-4">
              {/* Left Section - Description and Rating */}
              <div className="flex-1 flex flex-col gap-6">
                {/* Description Section */}
                <div className="flex flex-col gap-2">
                  <h2 className="text-slate-500 text-base font-semibold">
                    Deskripsi
                  </h2>
                  <p className="text-base">{listing.description}</p>
                </div>

                {/* Rating Section */}
                {sellerRating && (
                  <div className="border border-slate-200 rounded-2xl p-6">
                    {/* Seller Profile */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 relative rounded-full overflow-hidden">
                        <Image
                          src={sellerRating.seller.profilePicture}
                          alt={sellerRating.seller.username}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          {sellerRating.seller.username}
                        </h3>
                        <div className="flex items-center gap-2">
                          <StarRating
                            rating={sellerRating.seller.overallRating}
                          />
                          <span className="text-sm text-slate-600">
                            {sellerRating.seller.overallRating} (
                            {sellerRating.seller.totalReviews})
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={handleSeeAllReviews}
                        className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        See profile &gt;
                      </button>
                    </div>

                    {/* Reviews Title */}
                    <h4 className="text-lg font-semibold mb-4">
                      Review untuk {sellerRating.seller.username}
                    </h4>

                    {/* Recent Reviews */}
                    <div className="space-y-4">
                      {sellerRating.recentReviews.map((review) => (
                        <div
                          key={review.id}
                          className="border-b border-slate-100 last:border-b-0 pb-4 last:pb-0"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <StarRating rating={review.rating} size={14} />
                            <span className="text-sm text-slate-500">
                              {review.timeAgo}
                            </span>
                          </div>
                          <div className="flex gap-3">
                            <div className="w-8 h-8 relative rounded-full overflow-hidden flex-shrink-0">
                              <Image
                                src={review.reviewerAvatar}
                                alt={review.reviewerName}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm mb-1">
                                {review.reviewerName}
                              </p>
                              <p className="text-sm text-slate-700 leading-relaxed">
                                {review.comment}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* See All Reviews Button */}
                    <button
                      onClick={handleSeeAllReviews}
                      className="w-full mt-4 py-2 text-center text-blue-600 hover:text-blue-800 transition-colors font-medium"
                    >
                      Lihat semua review
                    </button>
                  </div>
                )}
              </div>

              {/* Price and Action Section */}
              <div className="w-[302px] border border-slate-400 rounded-[32px] p-6 flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-slate-600 text-sm">Subtotal</span>
                  <span className="text-3xl font-semibold">
                    {formatPrice(listing.price * quantity)}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-6 border border-slate-400 rounded-2xl px-4 py-2">
                    <button
                      onClick={handleDecrement}
                      className="w-6 h-6 flex items-center justify-center hover:bg-slate-100 rounded-full transition-colors"
                      disabled={quantity <= 1}
                    >
                      <RiSubtractLine size={24} />
                    </button>
                    <span className="font-semibold min-w-[20px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={handleIncrement}
                      className="w-6 h-6 flex items-center justify-center hover:bg-slate-100 rounded-full transition-colors"
                      disabled={quantity >= listing.stock}
                    >
                      <RiAddLine size={24} />
                    </button>
                  </div>
                  <span className="font-medium">Stok: {listing.stock}</span>
                </div>

                <div className="flex flex-col gap-2">
                  <button className="bg-[hsla(0,6%,9%,1)] text-white font-semibold py-4 px-2 rounded-lg hover:bg-[hsla(0,6%,15%,1)] transition-colors">
                    Beli sekarang
                  </button>
                  <button
                    onClick={handleAddToCart}
                    disabled={isAddingToCart}
                    className="bg-[hsla(210,40%,96%,1)] text-[hsla(0,6%,9%,1)] font-semibold py-4 px-2 rounded-lg flex items-center justify-center gap-2 hover:bg-[hsla(210,40%,90%,1)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RiShoppingCartLine size={24} />
                    {isAddingToCart ? "Menambahkan..." : "Keranjang"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ItemPage({ params }) {
  return (
    <ProtectedRoute>
      <ItemPageContent params={params} />
    </ProtectedRoute>
  );
}
