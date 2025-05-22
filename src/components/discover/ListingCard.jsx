import Image from "next/image";
import { formatTimeAgo } from "@/utils/timeFormat";
import { formatPrice } from "@/utils/priceFormat";
import Link from "next/link";

const ListingCard = ({ listing }) => {
  return (
    <Link href={`/item/${listing.id}`}>
      <div className="w-[243px] flex flex-col p-2 rounded-lg transition-all duration-200 hover:bg-gray-200 shadow-[0_3_3px_0_rgba(0,0,0,0.4)] cursor-pointer">
        {/* User Info */}
        <div className="flex items-center gap-2 mb-2">
          <div className="relative w-8 h-8">
            <Image
              src={
                "/photo_profile/" + listing.seller.profilePicture ||
                "/photo_profile/default.jpg"
              }
              alt={listing.seller.username}
              fill
              className="rounded-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">
              {listing.seller.username}
            </span>
            <span className="text-xs text-gray-500">
              {formatTimeAgo(listing.createdAt)}
            </span>
          </div>
        </div>

        {/* Listing Image */}
        <div className="relative w-full h-[281px] mb-2">
          <Image
            src={"/listing_pict/" + listing.pictUrl}
            alt={listing.name}
            fill
            className="object-cover rounded-lg"
          />
        </div>

        {/* Listing Details */}
        <div className="flex flex-col">
          <h3 className="font-bold text-lg mb-1">{listing.name}</h3>
          <p className="font-semibold mb-1">{formatPrice(listing.price)}</p>
          <p className="text-sm text-gray-500">
            {listing.seller.shipDetails.city}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default ListingCard;
