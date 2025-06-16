import { useState, useEffect } from "react";
import Image from "next/image";
import { FaStar } from "react-icons/fa";
import { formatTimeAgo } from "@/utils/timeFormat";

const ReviewsTab = ({ userId }) => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Fetch overall stats only once when component mounts
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/users/${userId}/stats`);
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, [userId]);

  // Fetch filtered reviews whenever type or sortBy changes
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        // Only show loading on initial load
        if (reviews.length === 0) {
          setLoading(true);
        }
        const response = await fetch(
          `/api/users/${userId}/reviews?type=${type}&sortBy=${sortBy}`
        );
        const data = await response.json();
        setReviews(data.reviews);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [userId, type, sortBy]);

  const renderStars = (score) => {
    return [...Array(5)].map((_, index) => (
      <FaStar
        key={index}
        className={index < score ? "text-yellow-400" : "text-gray-300"}
      />
    ));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900 text-white rounded-xl p-4">
          <h3 className="text-lg font-semibold mb-2">Overall Rating</h3>
          <div className="flex items-center gap-2">
            <div className="text-3xl font-bold">
              {stats?.averageRating || "0.0"}
            </div>
            <div className="flex text-yellow-400">
              {renderStars(Math.round(stats?.averageRating || 0))}
            </div>
          </div>
          <div className="text-sm text-gray-300 mt-2">
            {stats?.total || 0} total reviews
          </div>
        </div>
        <div className="bg-gray-900 text-white rounded-xl p-4">
          <h3 className="text-lg font-semibold mb-2">As Buyer</h3>
          <div className="flex items-center gap-2">
            <div className="text-3xl font-bold">
              {stats?.asBuyerAvg || "0.0"}
            </div>
            <div className="flex text-yellow-400">
              {renderStars(Math.round(stats?.asBuyerAvg || 0))}
            </div>
          </div>
          <div className="text-sm text-gray-300 mt-2">
            {stats?.asBuyer || 0} reviews as buyer
          </div>
        </div>
        <div className="bg-gray-900 text-white rounded-xl p-4">
          <h3 className="text-lg font-semibold mb-2">As Seller</h3>
          <div className="flex items-center gap-2">
            <div className="text-3xl font-bold">
              {stats?.asSellerAvg || "0.0"}
            </div>
            <div className="flex text-yellow-400">
              {renderStars(Math.round(stats?.asSellerAvg || 0))}
            </div>
          </div>
          <div className="text-sm text-gray-300 mt-2">
            {stats?.asSeller || 0} reviews as seller
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setType("all")}
            className={`px-4 py-2 rounded-full transition-colors ${
              type === "all"
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All Reviews
          </button>
          <button
            onClick={() => setType("buyer")}
            className={`px-4 py-2 rounded-full transition-colors ${
              type === "buyer"
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            As Buyer
          </button>
          <button
            onClick={() => setType("seller")}
            className={`px-4 py-2 rounded-full transition-colors ${
              type === "seller"
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            As Seller
          </button>
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 bg-white"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="rating-high">Highest Rating</option>
          <option value="rating-low">Lowest Rating</option>
        </select>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No reviews found</div>
        ) : (
          reviews.map((review) => {
            // Fix the logic: if the review's sellerId matches userId, then this user is the seller
            // if the review's userId matches userId, then this user is the buyer
            const isUserTheSeller = review.sellerId === userId;
            const reviewerInfo = isUserTheSeller ? review.user : review.seller;
            const role = isUserTheSeller ? "penjual" : "pembeli";

            return (
              <div
                key={review.id}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
              >
                <div className="flex items-start gap-4">
                  <div className="relative w-12 h-12">
                    <Image
                      src={
                        reviewerInfo.profilePicture ||
                        "/photo_profile/default.jpg"
                      }
                      alt="Profile"
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">
                          {reviewerInfo.username}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Review sebagai {role}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex text-yellow-400">
                          {renderStars(review.score)}
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatTimeAgo(review.createdAt)}
                        </span>
                      </div>
                    </div>
                    <p className="mt-2 text-gray-700">{review.review}</p>
                    <p className="mt-1 text-sm text-gray-500">
                      Item: {review.listing.name}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ReviewsTab;
