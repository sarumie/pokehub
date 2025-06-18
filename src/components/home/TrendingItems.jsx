"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/utils/priceFormat";
import Loading from "@/components/Loading";

const TrendingItems = () => {
  const [trendingItems, setTrendingItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrendingItems = async () => {
      try {
        const response = await fetch("/api/listings/trending");
        const data = await response.json();
        setTrendingItems(data);
      } catch (error) {
        console.error("Error fetching trending items:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingItems();
  }, []);

  if (loading) {
    return (
      <section className="bg-white p-9 shadow-md rounded-4xl mx-auto">
        <h2 className="text-xl font-bold">Trending Items</h2>
        <Loading fullScreen={false} message="Loading trending items..." />
      </section>
    );
  }

  return (
    <section className="bg-white p-9 shadow-md rounded-4xl mx-auto overflow-x-auto">
      <h2 className="text-xl font-bold">Trending Items</h2>
      <div className="flex justify-between mt-3 gap-6 flex-nowrap">
        {trendingItems.map((item) => (
          <Link href={`/item/${item.id}`} key={item.id}>
            <div className="flex flex-col items-center transition-transform duration-200 transform hover:-translate-y-1">
              <div className="relative w-68 h-68">
                <Image
                  src={item.pictUrl}
                  alt={item.name}
                  fill
                  className="object-contain rounded-2xl"
                  sizes="(max-width: 768px) 100vw, 272px"
                />
              </div>
              <div className="mt-2 text-center">
                <h3 className="font-semibold">{item.name}</h3>
                <p className="">{formatPrice(item.price)}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default TrendingItems;
