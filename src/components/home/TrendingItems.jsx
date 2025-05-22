import React from "react";
import Image from "next/image";
import pikachu from "#/assets/pikachu-card.png";
import gengar from "#/assets/gengar-card.png";
import grimer from "#/assets/grimer-card.png";
import alakazam from "#/assets/alakazam-card.png";

const TrendingItems = () => {
  const trendingItems = [
    { name: "Creepy Pikachu", img: pikachu },
    { name: "Gengar", img: gengar },
    { name: "Grimer", img: grimer },
    { name: "Alakazam", img: alakazam },
  ];

  return (
    <section className="bg-white p-9 shadow-md rounded-4xl mx-auto overflow-x-auto">
      <h2 className="text-xl font-bold">Trending Items</h2>
      <div className="flex justify-between mt-3 gap-6 flex-nowrap">
        {trendingItems.map((item, index) => (
          <div
            key={index}
            className="flex flex-col items-center transition-transform duration-200 transform hover:-translate-y-1"
          >
            <div className="relative w-68 h-68">
              <Image
                src={item.img}
                alt={item.name}
                fill
                className="object-contain rounded-2xl"
                sizes="(max-width: 768px) 100vw, 272px"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TrendingItems;
