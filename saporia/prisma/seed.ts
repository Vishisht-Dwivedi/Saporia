import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";

async function main() {
  console.log("🌱 Seeding started...");

  // 🧹 Clean DB
  await prisma.feedback.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.order.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.restaurant.deleteMany();
  await prisma.user.deleteMany();

  // 🔐 Password
  const password = await bcrypt.hash("1234", 10);

  // 👤 Customer
  await prisma.user.create({
    data: {
      name: "customer1",
      password,
      role: "CUSTOMER",
      lat: 23.25,
      lng: 77.41
    }
  });

  // 📍 Restaurants
  const restaurantInfos = [
    { name: "Sharma Vishnu Fast Food", lat: 23.2336, lng: 77.4340 },
    { name: "Manohar Dairy & Restaurant", lat: 23.2599, lng: 77.4126 },
    { name: "Under The Mango Tree", lat: 23.2177, lng: 77.4029 },
    { name: "Indian Coffee House", lat: 23.2324, lng: 77.4007 },
    { name: "Bapu Ki Kutia", lat: 23.2095, lng: 77.4090 },
    { name: "Hakeem's Restaurant", lat: 23.2580, lng: 77.4105 },
    { name: "Zam Zam Restaurant", lat: 23.2660, lng: 77.3950 },
    { name: "Taste of India", lat: 23.2400, lng: 77.4100 },
    { name: "Cafe Coffee Day", lat: 23.2300, lng: 77.4200 },
    { name: "Domino's Pizza", lat: 23.2500, lng: 77.4300 },
    { name: "The Belgian Waffle Co.", lat: 23.2450, lng: 77.4150 },
    { name: "Sagar Gaire", lat: 23.2350, lng: 77.4050 },
    { name: "Amado Cafe", lat: 23.2200, lng: 77.3950 },
    { name: "Ranjit Lakeview", lat: 23.2465, lng: 77.4023 },
    { name: "Pin and Pan", lat: 23.2250, lng: 77.4100 }
  ];
  const foodImageMap: Record<string, string> = {
    // Indian
    "Dal Tadka": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYVBfnYGo-E5hZMW33sxJT1rrQNN0diBjOsw&s",
    "Paneer Butter Masala": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQRQMKHs5qBBmBwVN6e7UTPlt3PpK2c6T8XA&s",
    "Kadai Paneer": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQRMQBO6XkbXnpcM5LTVXKxb_t2ab4zQGSztQ&s",
    "Veg Biryani": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTtDiMiok2ektyhL9ZFNhPX3psPNJKIaVY3Ng&s",
    "Jeera Rice": "https://www.whiskaffair.com/wp-content/uploads/2021/06/Jeera-Rice-2-3-1-500x375.jpg",
    "Butter Naan": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTww8shUIMWSTmMWK-gy0If0w7mBaIiVapWQ&s",
    "Tandoori Roti": "https://www.indianhealthyrecipes.com/wp-content/uploads/2023/09/tandoori-roti-recipe.jpg",
    "Gulab Jamun": "https://www.vegrecipesofindia.com/wp-content/uploads/2022/10/gulab-jamun-recipe-01.jpg",
    "Lassi": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTLLg83AMzi5zbjuKkZOLMJlWgvLXVDHBxzLw&s",
    "Masala Papad": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSkdI0CKzmwWqTayhCEaLElQrEVy2hYn3VUkg&s",

    // Fast Food
    "Burger": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSOsYOnhSQXYIbmGMrYCVUmYeIMnX22FTHewA&s",
    "Cheese Burger": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTuBic-snensuX1_i0HDDxRk3iVv0deCUG0gw&s",
    "Fries": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTIUzERgVNoFDB8gpKrOOxmu50m-gAy1Ph-_A&s",
    "Pizza": "https://www.tillamook.com/_next/image?url=https%3A%2F%2Fimages.ctfassets.net%2Fj8tkpy1gjhi5%2F5OvVmigx6VIUsyoKz1EHUs%2Fb8173b7dcfbd6da341ce11bcebfa86ea%2FSalami-pizza-hero.jpg&w=3840&q=75",
    "Sandwich": "https://staticcookist.akamaized.net/wp-content/uploads/sites/22/2025/05/clubsandwich-1200x675.jpg",
    "Cold Coffee": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwb39dnHXFMWaZpGnWUWIvlUVgdsP40iDTUQ&s",
    "Milkshake": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTRQVM5o2WYIKov2153CCjO0p7iFFxYWvoRhw&s",
    "Hot Dog": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHeLkcqgOn3kYqsOfP0m7pfCNh2OOQXuL4hg&s",
    "Nachos": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQfBFuk7Whsr9DF0nS6GK_ccVNLJwG5dkj7xA&s",
    "Wrap": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRhjV1WfCbxxm5khR0Fil44_hSWV99RHqPgSw&s",

    // Cafe
    "Cappuccino": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQXCjQlsBZIAV0LsneV7WRawhdQGm4l_jqkcg&s",
    "Latte": "https://source.unsplash.com/400x300/?latte",
    "Espresso": "https://source.unsplash.com/400x300/?espresso",
    "Brownie": "https://source.unsplash.com/400x300/?brownie",
    "Waffle": "https://source.unsplash.com/400x300/?waffle",
    "Pancakes": "https://source.unsplash.com/400x300/?pancakes",
    "Garlic Bread": "https://source.unsplash.com/400x300/?garlic,bread",
    "Veg Sandwich": "https://source.unsplash.com/400x300/?veg,sandwich",
    "Pasta": "https://source.unsplash.com/400x300/?pasta",

    // Sweets
    "Rasgulla": "https://source.unsplash.com/400x300/?rasgulla",
    "Kaju Katli": "https://source.unsplash.com/400x300/?kaju,katli",
    "Jalebi": "https://source.unsplash.com/400x300/?jalebi",
    "Rabri": "https://source.unsplash.com/400x300/?rabri",
    "Milk Cake": "https://source.unsplash.com/400x300/?milk,cake",
    "Ladoo": "https://source.unsplash.com/400x300/?ladoo",
    "Barfi": "https://source.unsplash.com/400x300/?barfi",
    "Kulfi": "https://source.unsplash.com/400x300/?kulfi",
    "Falooda": "https://source.unsplash.com/400x300/?falooda",

    // Nonveg
    "Chicken Biryani": "https://source.unsplash.com/400x300/?chicken,biryani",
    "Butter Chicken": "https://source.unsplash.com/400x300/?butter,chicken",
    "Chicken Curry": "https://source.unsplash.com/400x300/?chicken,curry",
    "Tandoori Chicken": "https://source.unsplash.com/400x300/?tandoori,chicken",
    "Fish Fry": "https://source.unsplash.com/400x300/?fish,fry",
    "Mutton Curry": "https://source.unsplash.com/400x300/?mutton,curry",
    "Chicken Tikka": "https://source.unsplash.com/400x300/?chicken,tikka",
    "Egg Curry": "https://source.unsplash.com/400x300/?egg,curry",
    "Keema": "https://source.unsplash.com/400x300/?keema",
    "Seekh Kebab": "https://source.unsplash.com/400x300/?seekh,kebab"
  };
  const baseMenus = {
    indian: [
      "Dal Tadka", "Paneer Butter Masala", "Kadai Paneer", "Veg Biryani",
      "Jeera Rice", "Butter Naan", "Tandoori Roti", "Gulab Jamun",
      "Lassi", "Masala Papad"
    ],
    fastfood: [
      "Burger", "Cheese Burger", "Fries", "Pizza", "Sandwich",
      "Cold Coffee", "Milkshake", "Hot Dog", "Nachos", "Wrap"
    ],
    cafe: [
      "Cappuccino", "Latte", "Espresso", "Cold Coffee",
      "Brownie", "Waffle", "Pancakes", "Garlic Bread",
      "Veg Sandwich", "Pasta"
    ],
    sweets: [
      "Rasgulla", "Kaju Katli", "Gulab Jamun", "Jalebi",
      "Rabri", "Milk Cake", "Ladoo", "Barfi",
      "Kulfi", "Falooda"
    ],
    nonveg: [
      "Chicken Biryani", "Butter Chicken", "Chicken Curry",
      "Tandoori Chicken", "Fish Fry", "Mutton Curry",
      "Chicken Tikka", "Egg Curry", "Keema", "Seekh Kebab"
    ]
  };

  const restaurantMenuType: Record<string, (keyof typeof baseMenus)[]> = {
    "Sharma Vishnu Fast Food": ["fastfood"],
    "Manohar Dairy & Restaurant": ["indian", "sweets"],
    "Under The Mango Tree": ["indian"],
    "Indian Coffee House": ["indian", "cafe"],
    "Bapu Ki Kutia": ["indian"],
    "Hakeem's Restaurant": ["nonveg", "indian"],
    "Zam Zam Restaurant": ["nonveg"],
    "Taste of India": ["indian"],
    "Cafe Coffee Day": ["cafe"],
    "Domino's Pizza": ["fastfood"],
    "The Belgian Waffle Co.": ["cafe", "sweets"],
    "Sagar Gaire": ["fastfood"],
    "Amado Cafe": ["cafe"],
    "Ranjit Lakeview": ["indian", "nonveg"],
    "Pin and Pan": ["cafe", "fastfood"]
  };

  const restaurantRecords = [];
  const restaurantImages: Record<string, string> = {
    "Sharma Vishnu Fast Food": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d",
    "Manohar Dairy & Restaurant": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5",
    "Under The Mango Tree": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0",
    "Indian Coffee House": "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb",
    "Bapu Ki Kutia": "https://images.unsplash.com/photo-1552566626-52f8b828add9",
    "Hakeem's Restaurant": "https://images.unsplash.com/photo-1541542684-4a0c0b1e2a36",
    "Zam Zam Restaurant": "https://images.unsplash.com/photo-1600891964599-f61ba0e24092",
    "Taste of India": "https://images.unsplash.com/photo-1592861956120-e524fc739696",
    "Cafe Coffee Day": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085",
    "Domino's Pizza": "https://images.unsplash.com/photo-1594007654729-407eedc4be65",
    "The Belgian Waffle Co.": "https://images.unsplash.com/photo-1513442542250-854d436a73f2",
    "Sagar Gaire": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd",
    "Amado Cafe": "https://images.unsplash.com/photo-1509042239860-f550ce710b93",
    "Ranjit Lakeview": "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
    "Pin and Pan": "https://images.unsplash.com/photo-1551782450-a2132b4ba21d"
  };
  // 🏪 Create restaurants
  for (const info of restaurantInfos) {
    const user = await prisma.user.create({
      data: {
        name: info.name,
        password,
        role: "RESTAURANT",
        lat: info.lat,
        lng: info.lng
      }
    });
    const restaurant = await prisma.restaurant.create({
      data: {
        name: info.name,
        userId: user.id,
        lat: info.lat,
        lng: info.lng,
        image: restaurantImages[info.name] || "https://via.placeholder.com/300"
      }
    });

    restaurantRecords.push(restaurant);
  }

  // 🍽️ Menus
  for (const r of restaurantRecords) {
    const types = restaurantMenuType[r.name] || ["indian"];
    let items: string[] = [];
    for (const t of types) items = items.concat(baseMenus[t]);

    items = [...new Set(items)].slice(0, 12);
    items.forEach(item => console.log(foodImageMap[item]));
    await prisma.menuItem.createMany({
      data: items.map(name => ({
        name,
        price: Math.floor(Math.random() * 250) + 80,
        restaurantId: r.id,
        image: foodImageMap[name] || "https://source.unsplash.com/400x300/?food"
    }))
  });
  }

  // 🛵 Delivery agents
  await prisma.user.createMany({
    data: [
      { name: "agent1", password, role: "DELIVERY", lat: 23.27, lng: 77.43 },
      { name: "agent2", password, role: "DELIVERY", lat: 23.28, lng: 77.44 }
    ] as any
  });

  console.log("✅ Seeding finished.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());