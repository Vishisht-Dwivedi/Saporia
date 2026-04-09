import { prisma } from "@/lib/prisma";

export async function GET() {
  console.log('[GET /api/menu-items] Fetching all menu items')
  
  // Fetch all menu items with their restaurant info
  const items = await prisma.menuItem.findMany({
    include: {
      restaurant: {
        select: {
          id: true,
          name: true,
          image: true
        }
      }
    }
  })

  // Group by item name to get unique food items with all restaurants that serve them
  const uniqueItems: Record<string, any> = {}
  
  items.forEach(item => {
    if (!uniqueItems[item.name]) {
      uniqueItems[item.name] = {
        id: item.id, // Use the first item's ID as the food item ID
        name: item.name,
        price: item.price,
        image: item.image,
        restaurants: []
      }
    }
    uniqueItems[item.name].restaurants.push({
      id: item.restaurant.id,
      name: item.restaurant.name,
      image: item.restaurant.image,
      menuItemId: item.id  // Include the specific menu item ID for this restaurant
    })
  })

  const result = Object.values(uniqueItems)
  console.log('[GET /api/menu-items] Found', result.length, 'unique items')
  return Response.json(result)
}
