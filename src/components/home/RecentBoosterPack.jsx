"use client";
import React from "react";
import Image from "next/image";
import prismatic from "#/assets/prismatic.png";
import surging from "#/assets/sparks.png";
import stellar from "#/assets/stellar.png";

const RecentBoosterPack = () => {
  const boosterPacks = [
    { name: "Prismatic Evolutions", year: 2025, img: prismatic },
    { name: "Surging Sparks", year: 2024, img: surging },
    { name: "Stellar Crown", year: 2024, img: stellar },
  ];

  return (
    <section className="bg-white p-9 shadow-md rounded-4xl mx-auto mt-6">
      <h2 className="text-xl font-bold">Recent Booster Pack</h2>
      <div className="flex justify-between mt-3 flex-wrap gap-6">
        {boosterPacks.map((pack, index) => (
          <div
            key={index}
            className="flex flex-col items-center transition-transform duration-200 transform hover:-translate-y-1"
          >
            <div className="relative w-80 h-48">
              <Image
                src={pack.img}
                alt={pack.name}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 320px"
              />
            </div>
            <p className="text-center font-semibold mt-2">{pack.name}</p>
            <p className="text-sm text-gray-500">{pack.year}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RecentBoosterPack;
