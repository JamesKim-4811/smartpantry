-- CreateTable
CREATE TABLE "Household" (
    "household_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "user_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "household_id" INTEGER NOT NULL,
    CONSTRAINT "User_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "Household" ("household_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FoodItem" (
    "food_item_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "calories_per_unit" REAL,
    "protein_per_unit" REAL,
    "carbs_per_unit" REAL,
    "fat_per_unit" REAL
);

-- CreateTable
CREATE TABLE "Unit" (
    "unit_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "unit_name" TEXT NOT NULL,
    "unit_type" TEXT
);

-- CreateTable
CREATE TABLE "InventoryEntry" (
    "entry_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "household_id" INTEGER NOT NULL,
    "food_item_id" INTEGER NOT NULL,
    "unit_id" INTEGER NOT NULL,
    "added_by_user_id" INTEGER NOT NULL,
    "quantity" REAL NOT NULL,
    "purchase_date" TEXT NOT NULL,
    "expiration_date" TEXT,
    "storage_location" TEXT NOT NULL,
    CONSTRAINT "InventoryEntry_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "Household" ("household_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "InventoryEntry_food_item_id_fkey" FOREIGN KEY ("food_item_id") REFERENCES "FoodItem" ("food_item_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "InventoryEntry_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "Unit" ("unit_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "InventoryEntry_added_by_user_id_fkey" FOREIGN KEY ("added_by_user_id") REFERENCES "User" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MealLog" (
    "meal_log_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "logged_at" TEXT NOT NULL,
    "notes" TEXT,
    CONSTRAINT "MealLog_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MealLogEntry" (
    "entry_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "meal_log_id" INTEGER NOT NULL,
    "food_item_id" INTEGER NOT NULL,
    "unit_id" INTEGER NOT NULL,
    "quantity" REAL NOT NULL,
    CONSTRAINT "MealLogEntry_meal_log_id_fkey" FOREIGN KEY ("meal_log_id") REFERENCES "MealLog" ("meal_log_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MealLogEntry_food_item_id_fkey" FOREIGN KEY ("food_item_id") REFERENCES "FoodItem" ("food_item_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MealLogEntry_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "Unit" ("unit_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ShoppingList" (
    "list_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "household_id" INTEGER NOT NULL,
    "created_at" TEXT NOT NULL,
    CONSTRAINT "ShoppingList_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "Household" ("household_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ShoppingListItem" (
    "item_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "list_id" INTEGER NOT NULL,
    "food_item_id" INTEGER NOT NULL,
    "unit_id" INTEGER NOT NULL,
    "added_by_user_id" INTEGER NOT NULL,
    "quantity" REAL NOT NULL,
    "is_purchased" BOOLEAN NOT NULL DEFAULT false,
    "added_at" TEXT NOT NULL,
    CONSTRAINT "ShoppingListItem_list_id_fkey" FOREIGN KEY ("list_id") REFERENCES "ShoppingList" ("list_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ShoppingListItem_food_item_id_fkey" FOREIGN KEY ("food_item_id") REFERENCES "FoodItem" ("food_item_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ShoppingListItem_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "Unit" ("unit_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ShoppingListItem_added_by_user_id_fkey" FOREIGN KEY ("added_by_user_id") REFERENCES "User" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Recipe" (
    "recipe_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_by_user_id" INTEGER NOT NULL,
    CONSTRAINT "Recipe_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "User" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RecipeIngredient" (
    "recipe_ingredient_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "recipe_id" INTEGER NOT NULL,
    "food_item_id" INTEGER NOT NULL,
    "unit_id" INTEGER NOT NULL,
    "quantity" REAL NOT NULL,
    CONSTRAINT "RecipeIngredient_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "Recipe" ("recipe_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RecipeIngredient_food_item_id_fkey" FOREIGN KEY ("food_item_id") REFERENCES "FoodItem" ("food_item_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RecipeIngredient_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "Unit" ("unit_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "notification_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ShoppingList_household_id_key" ON "ShoppingList"("household_id");
