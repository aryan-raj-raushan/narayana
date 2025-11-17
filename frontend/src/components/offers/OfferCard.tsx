'use client';

import Image from 'next/image';
import Link from 'next/link';

interface OfferCardProps {
  offer: {
    _id: string;
    name: string;
    image?: string;
    homepageSubtitle?: string;
    homepagePrice?: string;
    homepageCategory?: string;
    subcategoryIds?: string[];
    productIds?: string[];
  };
}

export default function OfferCard({ offer }: OfferCardProps) {
  // Build the link URL - link to products page filtered by productIds
  const getLinkUrl = () => {
    const params = new URLSearchParams();

    // Filter by specific products attached to the offer
    if (offer.productIds && offer.productIds.length > 0) {
      params.set('productIds', offer.productIds.join(','));
    }

    // Add offer ID for tracking
    params.set('offerId', offer._id);

    return `/products?${params.toString()}`;
  };

  return (
    <Link href={getLinkUrl()} className="block group">
      <div className="relative w-full h-[400px] md:h-[500px] rounded-lg overflow-hidden shadow-lg">
        {/* Background Image */}
        {offer.image ? (
          <Image
            src={offer.image}
            alt={offer.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900" />
        )}

        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          {/* Subtitle (e.g., "Under", "BUY 3") */}
          {offer.homepageSubtitle && (
            <p className="text-sm font-medium uppercase tracking-wider mb-1 opacity-90">
              {offer.homepageSubtitle}
            </p>
          )}

          {/* Price (e.g., "₹500", "₹3000") */}
          {offer.homepagePrice && (
            <h3 className="text-4xl md:text-5xl font-bold mb-2">
              {offer.homepagePrice}
            </h3>
          )}

          {/* Category (e.g., "Shirts", "T-Shirts") */}
          {offer.homepageCategory && (
            <p className="text-lg font-semibold uppercase tracking-wide">
              {offer.homepageCategory}
            </p>
          )}
        </div>

        {/* Hover Effect Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
      </div>
    </Link>
  );
}
