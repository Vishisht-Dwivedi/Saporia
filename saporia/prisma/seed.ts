import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

import { prisma } from "../lib/prisma";

async function main() {
  console.log("Seeding...")


  // clear old data
  console.log("Deleting old orders...")
  // delete dependent records first
  console.log("Deleting old feedback...")
  await prisma.feedback.deleteMany()
  console.log("Deleting old notifications...")
  await prisma.notification.deleteMany()
  await prisma.order.deleteMany()
  console.log("Deleting old menu items...")
  await prisma.menuItem.deleteMany()
  console.log("Deleting old restaurants...")
  await prisma.restaurant.deleteMany()
  console.log("Deleting old users...")
  await prisma.user.deleteMany()

  const password = await bcrypt.hash("1234", 10)
  console.log("Password hash generated for all users:", password)


  // 👤 Customer
  const customer = await prisma.user.create({
    data: {
      name: "customer1",
      password,
      role: "CUSTOMER",
      lat: 23.25,
      lng: 77.41
    }
  })
  console.log("Created customer:", customer)


  // 🏪 Restaurant Users & Restaurants
  const restaurantInfos = [
    { name: "Pizza Place", lat: 23.26, lng: 77.42 },
    { name: "Burger Hub", lat: 23.261, lng: 77.421 },
    { name: "Pasta Point", lat: 23.262, lng: 77.422 },
    { name: "Sushi Spot", lat: 23.263, lng: 77.423 },
    { name: "Taco Town", lat: 23.264, lng: 77.424 }
  ]
  const restaurantUsers = []
  const restaurantRecords = []
  for (const info of restaurantInfos) {
    const user = await prisma.user.create({
      data: {
        name: info.name,
        password,
        role: "RESTAURANT",
        lat: info.lat,
        lng: info.lng
      }
    })
    restaurantUsers.push(user)
    const restaurant = await prisma.restaurant.create({
      data: {
        name: info.name,
        userId: user.id,
        lat: info.lat,
        lng: info.lng
      }
    })
    restaurantRecords.push(restaurant)
    console.log(`Created restaurant user and record for ${info.name}:`, { user, restaurant })
  }

  // 🍕 Menus for each restaurant
  for (const r of restaurantRecords) {
    let menu: { name: string; price: number }[] = []
    if (r.name === "Pizza Place") menu = [
      { name: "Pizza", price: 200 },
      { name: "Burger", price: 120 },
      { name: "Pasta", price: 180 }
    ]
    else if (r.name === "Burger Hub") menu = [
      { name: "Cheese Burger", price: 150 },
      { name: "Veg Burger", price: 100 },
      { name: "Fries", price: 80 }
    ]
    else if (r.name === "Pasta Point") menu = [
      { name: "Red Sauce Pasta", price: 170 },
      { name: "White Sauce Pasta", price: 180 },
      { name: "Garlic Bread", price: 90 }
    ]
    else if (r.name === "Sushi Spot") menu = [
      { name: "Salmon Sushi", price: 300 },
      { name: "Tuna Roll", price: 250 },
      { name: "Miso Soup", price: 110 }
    ]
    else if (r.name === "Taco Town") menu = [
      { name: "Chicken Taco", price: 140 },
      { name: "Veg Taco", price: 120 },
      { name: "Nachos", price: 100 }
    ]
    const menuData = menu.map(item => ({ ...item, restaurantId: r.id }))
    await prisma.menuItem.createMany({ data: menuData })
    console.log(`Created menu for ${r.name}:`, menuData)
  }

  // Create a sample order for the customer using the first restaurant/menu item
  if (restaurantRecords.length > 0) {
    const firstRestaurant = restaurantRecords[0]
    const menuItem = await prisma.menuItem.findFirst({ where: { restaurantId: firstRestaurant.id } })
    if (menuItem) {
      const dx = firstRestaurant.lat - customer.lat
      const dy = firstRestaurant.lng - customer.lng
      const distance = Math.sqrt(dx * dx + dy * dy)
      const fixedValue = 8
      const deliveryFee = parseFloat((distance * fixedValue).toFixed(2))
      const totalPrice = parseFloat((menuItem.price + deliveryFee).toFixed(2))
      const order = await prisma.order.create({
        data: {
          customerId: customer.id,
          restaurantId: firstRestaurant.id,
          status: "PENDING_RESTAURANT",
          totalPrice,
          deliveryFee,
          customerLat: customer.lat,
          customerLng: customer.lng,
          menuItemId: menuItem.id,
          menuItemName: menuItem.name,
          menuItemPrice: menuItem.price
        }
      })
      console.log("Created sample order:", order)
    } else {
      console.log("No menu items found for first restaurant, skipping sample order")
    }
  }

  // 🛵 Delivery Agents
  const agents = [
    {
      name: "agent1",
      password,
      role: "DELIVERY",
      lat: 23.27,
      lng: 77.43
    },
    {
      name: "agent2",
      password,
      role: "DELIVERY",
      lat: 23.28,
      lng: 77.44
    }
  ]
  // createMany typing expects the Role enum; cast to any for seed convenience
  await prisma.user.createMany({ data: agents as any })
  console.log("Created delivery agents:", agents)

  console.log("Seeding done ✅")
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())