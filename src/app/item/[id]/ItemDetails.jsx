"use client";

import Image from "next/image";
import { formatPrice } from "@/utils/priceFormat";
import { formatTimeAgo } from "@/utils/timeFormat";
import { useEffect, useState } from "react";

export default function ItemDetails({ id }) {
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function getListing() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/listings/${id}`
        );

        if (!res.ok) {
          throw new Error("Failed to fetch listing");
        }

        const data = await res.json();
        setListing(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    getListing();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-[500px] bg-gray-200 rounded-lg mb-8"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-8"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div>Listing not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column - Image */}
        <div className="relative w-full h-[500px]">
          <Image
            src={"/listing_pict/" + listing.pictUrl}
            alt={listing.name}
            fill
            className="object-cover rounded-lg"
          />
        </div>

        {/* Right Column - Details */}
        <div className="flex flex-col gap-6">
          {/* Title and Price */}
          <div>
            <h1 className="text-3xl font-bold mb-2">{listing.name}</h1>
            <p className="text-2xl font-semibold text-red-500">
              {formatPrice(listing.price)}
            </p>
          </div>

          {/* Seller Info */}
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12">
              <Image
                src={
                  listing.seller.profilePicture || "/photo_profile/default.jpg"
                }
                alt={listing.seller.username}
                fill
                className="rounded-full object-cover"
              />
            </div>
            <div>
              <p className="font-semibold">{listing.seller.username}</p>
              <p className="text-sm text-gray-500">
                {listing.seller.shipDetails.city}
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-gray-700">{listing.description}</p>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Stock</p>
              <p className="font-semibold">{listing.stock} available</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Listed</p>
              <p className="font-semibold">
                {formatTimeAgo(listing.createdAt)}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-4">
            <button className="flex-1 bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors">
              Add to Cart
            </button>
            <button className="flex-1 border border-red-500 text-red-500 py-3 rounded-lg font-semibold hover:bg-red-50 transition-colors">
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
