"use client";
import { useRef } from "react";
import Card from "../components/Card";

// 🔹 Define types
type Restaurant = {
  id: string;
  name: string;
  image: string;
};

type Props = {
  restaurants: Restaurant[];
  loadMenu: (restaurant: Restaurant) => void;
};

export default function RestaurantSlider({ restaurants, loadMenu }: Props) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;

    scrollRef.current.scrollBy({
      left: dir === "left" ? -300 : 300,
      behavior: "smooth"
    });
  };

  return (
    <div className="relative w-full">
      
      {/* Left Arrow */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-3 hover:bg-gray-100"
      >
        <img src="/leftArrow.png" className="w-4" alt="" />
      </button>

      {/* Slider */}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scroll-smooth no-scrollbar px-8 snap-x snap-mandatory"
      >
        {restaurants.map((r) => (
          <Card
            key={r.id}
            className="snap-start min-w-65 max-w-65 shrink-0 overflow-hidden border border-gray-200/70 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-80"
          >
            <div className="w-full h-40 overflow-hidden">
              <img
                src={r.image}
                alt={r.name}
                className="w-full h-full object-cover rounded-t-lg"
              />
            </div>

            <div className="flex flex-col flex-1 p-4 justify-between">
              <div>
                <h3 className="text-base font-semibold text-gray-800 line-clamp-1">
                  {r.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Nearby • Fast Delivery
                </p>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-sm font-medium text-gray-700">
                  ⭐ 4.2
                </span>

                <button
                  className="text-xs px-3 py-1.5 rounded-full bg-red-500 text-white hover:bg-red-600 transition"
                  onClick={() => loadMenu(r)}
                >
                  View
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Right Arrow */}
      <button
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-3 hover:bg-gray-100"
      >
        <img src="/rightArrow.png" className="w-4" alt="" />
      </button>
    </div>
  );
}