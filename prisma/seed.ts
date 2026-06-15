import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

function future(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

async function main() {
  const existing = await prisma.household.count();
  if (existing > 0) {
    console.log("⏭️  Data exists, skipping seed.");
    return;
  }

  const today = new Date().toISOString().split("T")[0];

  // Household
  const household = await prisma.household.create({
    data: { name: "The Kim-Dawson Household" },
  });

  // Users
  const [james, dijonay] = await Promise.all([
    prisma.user.create({ data: { first_name: "James",   last_name: "Kim",    email: "james.kim@email.com",    password_hash: "hash1", role: "Admin",  household_id: household.household_id } }),
    prisma.user.create({ data: { first_name: "Dijonay", last_name: "Dawson", email: "dijonay.dawson@email.com", password_hash: "hash2", role: "Member", household_id: household.household_id } }),
  ]);

  // Units
  await prisma.unit.createMany({
    data: [
      { unit_name: "grams",  unit_type: "weight" },
      { unit_name: "kg",     unit_type: "weight" },
      { unit_name: "ml",     unit_type: "volume" },
      { unit_name: "liters", unit_type: "volume" },
      { unit_name: "pieces", unit_type: "count"  },
      { unit_name: "slices", unit_type: "count"  },
      { unit_name: "cups",   unit_type: "volume" },
      { unit_name: "oz",     unit_type: "weight" },
    ],
  });

  // Food items
  await prisma.foodItem.createMany({
    data: [
      { name: "Chicken Breast",  calories_per_unit: 1.65,  protein_per_unit: 0.31,  carbs_per_unit: 0.0,   fat_per_unit: 0.036 },
      { name: "Whole Milk",      calories_per_unit: 61.0,  protein_per_unit: 3.2,   carbs_per_unit: 4.8,   fat_per_unit: 3.3   },
      { name: "Eggs",            calories_per_unit: 78.0,  protein_per_unit: 6.0,   carbs_per_unit: 0.6,   fat_per_unit: 5.0   },
      { name: "Bread",           calories_per_unit: 79.0,  protein_per_unit: 2.7,   carbs_per_unit: 15.0,  fat_per_unit: 1.0   },
      { name: "Cheddar Cheese",  calories_per_unit: 0.402, protein_per_unit: 0.025, carbs_per_unit: 0.001, fat_per_unit: 0.033 },
      { name: "Greek Yogurt",    calories_per_unit: 59.0,  protein_per_unit: 10.0,  carbs_per_unit: 3.6,   fat_per_unit: 0.4   },
      { name: "Spinach",         calories_per_unit: 0.23,  protein_per_unit: 0.029, carbs_per_unit: 0.036, fat_per_unit: 0.004 },
      { name: "Brown Rice",      calories_per_unit: 1.3,   protein_per_unit: 0.026, carbs_per_unit: 0.28,  fat_per_unit: 0.01  },
      { name: "Olive Oil",       calories_per_unit: 8.84,  protein_per_unit: 0.0,   carbs_per_unit: 0.0,   fat_per_unit: 1.0   },
      { name: "Pasta",           calories_per_unit: 1.31,  protein_per_unit: 0.05,  carbs_per_unit: 0.25,  fat_per_unit: 0.011 },
      { name: "Canned Tomatoes", calories_per_unit: 0.45,  protein_per_unit: 0.018, carbs_per_unit: 0.097, fat_per_unit: 0.005 },
      { name: "Bananas",         calories_per_unit: 89.0,  protein_per_unit: 1.1,   carbs_per_unit: 23.0,  fat_per_unit: 0.3   },
      { name: "Apples",          calories_per_unit: 52.0,  protein_per_unit: 0.3,   carbs_per_unit: 14.0,  fat_per_unit: 0.2   },
      { name: "Butter",          calories_per_unit: 7.17,  protein_per_unit: 0.008, carbs_per_unit: 0.001, fat_per_unit: 0.81  },
      { name: "Frozen Peas",     calories_per_unit: 0.81,  protein_per_unit: 0.054, carbs_per_unit: 0.141, fat_per_unit: 0.004 },
    ],
  });

  // Inventory entries
  await prisma.inventoryEntry.createMany({
    data: [
      { household_id: household.household_id, food_item_id: 1,  unit_id: 5, added_by_user_id: james.user_id,   quantity: 2.0,   purchase_date: today, expiration_date: future(5),   storage_location: "fridge"  },
      { household_id: household.household_id, food_item_id: 2,  unit_id: 4, added_by_user_id: dijonay.user_id, quantity: 1.0,   purchase_date: today, expiration_date: future(7),   storage_location: "fridge"  },
      { household_id: household.household_id, food_item_id: 3,  unit_id: 5, added_by_user_id: james.user_id,   quantity: 12.0,  purchase_date: today, expiration_date: future(14),  storage_location: "fridge"  },
      { household_id: household.household_id, food_item_id: 4,  unit_id: 6, added_by_user_id: dijonay.user_id, quantity: 8.0,   purchase_date: today, expiration_date: future(3),   storage_location: "fridge"  },
      { household_id: household.household_id, food_item_id: 5,  unit_id: 1, added_by_user_id: james.user_id,   quantity: 200.0, purchase_date: today, expiration_date: future(30),  storage_location: "fridge"  },
      { household_id: household.household_id, food_item_id: 8,  unit_id: 1, added_by_user_id: dijonay.user_id, quantity: 500.0, purchase_date: today, expiration_date: future(180), storage_location: "pantry"  },
      { household_id: household.household_id, food_item_id: 9,  unit_id: 3, added_by_user_id: james.user_id,   quantity: 500.0, purchase_date: today, expiration_date: future(365), storage_location: "pantry"  },
      { household_id: household.household_id, food_item_id: 10, unit_id: 1, added_by_user_id: dijonay.user_id, quantity: 400.0, purchase_date: today, expiration_date: future(200), storage_location: "pantry"  },
    ],
  });

  // Shopping list
  const shoppingList = await prisma.shoppingList.create({
    data: { household_id: household.household_id, created_at: `${today} 10:00:00` },
  });

  await prisma.shoppingListItem.createMany({
    data: [
      { list_id: shoppingList.list_id, food_item_id: 2,  unit_id: 4, added_by_user_id: dijonay.user_id, quantity: 2.0,  is_purchased: false, added_at: `${today} 10:05:00` },
      { list_id: shoppingList.list_id, food_item_id: 3,  unit_id: 5, added_by_user_id: james.user_id,   quantity: 12.0, is_purchased: false, added_at: `${today} 10:06:00` },
      { list_id: shoppingList.list_id, food_item_id: 4,  unit_id: 6, added_by_user_id: dijonay.user_id, quantity: 1.0,  is_purchased: false, added_at: `${today} 10:10:00` },
      { list_id: shoppingList.list_id, food_item_id: 12, unit_id: 5, added_by_user_id: james.user_id,   quantity: 6.0,  is_purchased: true,  added_at: `${today} 10:12:00` },
    ],
  });

  console.log("✅ Seed complete");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
