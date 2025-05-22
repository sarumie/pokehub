"use client";
import { useState } from "react";
import Image from "next/image";
import news1 from "#/assets/news1.png";
import news2 from "#/assets/news2.png";
import news3 from "#/assets/news3.png";
import news4 from "#/assets/news4.png";

const NewsCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [news1, news2, news3, news4];

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () =>
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <section className="bg-white p-9 shadow-md rounded-4xl mx-auto relative">
      <h2 className="text-xl font-bold mb-3">Pokemon News</h2>

      {/* Carousel Wrapper */}
      <div className="relative">
        {/* Left Arrow */}
        <button
          onClick={prevSlide}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 text-2xl bg-white p-2 rounded-full shadow-md"
        >
          ⬅
        </button>

        {/* Image Slider */}
        <div className="relative w-full h-[250px]">
          <Image
            src={slides[currentSlide]}
            alt={`Slide ${currentSlide + 1}`}
            fill
            className="object-contain rounded-2xl"
            priority={currentSlide === 0}
          />
        </div>

        {/* Right Arrow */}
        <button
          onClick={nextSlide}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 text-2xl bg-white p-2 rounded-full shadow-md"
        >
          ➡
        </button>
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center mt-3">
        {slides.map((_, index) => (
          <span
            key={index}
            className={`w-3 h-3 mx-1 rounded-full ${
              currentSlide === index ? "bg-black" : "bg-gray-300"
            }`}
          ></span>
        ))}
      </div>
    </section>
  );
};

export default NewsCarousel;
