import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

import { prisma } from "../lib/prisma";

async function main() {
  console.log("Seeding...")

  // clear old data
  await prisma.order.deleteMany()
  await prisma.menuItem.deleteMany()
  await prisma.restaurant.deleteMany()
  await prisma.user.deleteMany()

  const password = await bcrypt.hash("1234", 10)

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

  // 🏪 Restaurant
  const restaurant = await prisma.restaurant.create({
    data: {
      name: "Pizza Place",
      lat: 23.26,
      lng: 77.42
    }
  })

  // 🍕 Menu
  await prisma.menuItem.createMany({
    data: [
      { name: "Pizza", price: 200, restaurantId: restaurant.id },
      { name: "Burger", price: 120, restaurantId: restaurant.id },
      { name: "Pasta", price: 180, restaurantId: restaurant.id }
    ]
  })

  // 🛵 Delivery Agents
  await prisma.user.createMany({
    data: [
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
  })

  console.log("Seeding done ✅")
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())