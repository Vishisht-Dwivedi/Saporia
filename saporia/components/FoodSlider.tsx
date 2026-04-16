"use client";
import { useRef } from "react";
import Card from "../components/Card";

// Define types
type FoodItem = {
    id: string;
    name: string;
    price: number;
    image: string;
    restaurants: Array<{
        id: string;
        name: string;
        image: string;
        menuItemId: string;
    }>;
};

type Props = {
  foodItems: FoodItem[];
  selectFood: (food: FoodItem) => void;
};

export default function FoodSlider({ foodItems, selectFood }: Props) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  console.log(foodItems);
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
        className="flex gap-4 overflow-x-auto scroll-smooth no-scrollbar px-8 snap-x snap-mandatory"
      >
        {foodItems.map((food) => (
          <Card
            key={food.id}
            className="snap-start min-w-65 max-w-65 shrink-0 overflow-hidden border border-amber-200/70 rounded-sm shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-80"
          >
          <div className="relative w-full h-40 overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent" />
                <img
                  src={food.image?food.image:food.restaurants[0].image}
                  alt={food.name}
                  className="w-full h-full object-cover rounded-t-lg"
                />
            </div>

            <div className="flex flex-col flex-1 p-4 justify-between">
              <div>
                <h3 className="text-base font-semibold text-gray-800 line-clamp-1">
                  {food.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {food.restaurants.length} restaurant{food.restaurants.length !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-sm font-medium text-gray-700">
                  ₹{food.price}
                </span>

                <button
                  className="text-xs px-3 py-1.5 rounded-sm bg-amber-500 text-white hover:bg-amber-600 transition"
                  onClick={() => selectFood(food)}
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
