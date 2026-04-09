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
    await prisma.menuItem.createMany({
      data: items.map(name => ({
        name,
        price: Math.floor(Math.random() * 250) + 80,
        restaurantId: r.id
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