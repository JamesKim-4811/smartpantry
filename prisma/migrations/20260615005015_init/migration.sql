-- CreateTable
CREATE TABLE "Household" (
    "household_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Household_pkey" PRIMARY KEY ("household_id")
);

-- CreateTable
CREATE TABLE "User" (
    "user_id" SERIAL NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "household_id" INTEGER NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "FoodItem" (
    "food_item_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "calories_per_unit" DOUBLE PRECISION,
    "protein_per_unit" DOUBLE PRECISION,
    "carbs_per_unit" DOUBLE PRECISION,
    "fat_per_unit" DOUBLE PRECISION,

    CONSTRAINT "FoodItem_pkey" PRIMARY KEY ("food_item_id")
);

-- CreateTable
CREATE TABLE "Unit" (
    "unit_id" SERIAL NOT NULL,
    "unit_name" TEXT NOT NULL,
    "unit_type" TEXT,

    CONSTRAINT "Unit_pkey" PRIMARY KEY ("unit_id")
);

-- CreateTable
CREATE TABLE "InventoryEntry" (
    "entry_id" SERIAL NOT NULL,
    "household_id" INTEGER NOT NULL,
    "food_item_id" INTEGER NOT NULL,
    "unit_id" INTEGER NOT NULL,
    "added_by_user_id" INTEGER NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "purchase_date" TEXT NOT NULL,
    "expiration_date" TEXT,
    "storage_location" TEXT NOT NULL,

    CONSTRAINT "InventoryEntry_pkey" PRIMARY KEY ("entry_id")
);

-- CreateTable
CREATE TABLE "MealLog" (
    "meal_log_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "logged_at" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "MealLog_pkey" PRIMARY KEY ("meal_log_id")
);

-- CreateTable
CREATE TABLE "MealLogEntry" (
    "entry_id" SERIAL NOT NULL,
    "meal_log_id" INTEGER NOT NULL,
    "food_item_id" INTEGER NOT NULL,
    "unit_id" INTEGER NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "MealLogEntry_pkey" PRIMARY KEY ("entry_id")
);

-- CreateTable
CREATE TABLE "ShoppingList" (
    "list_id" SERIAL NOT NULL,
    "household_id" INTEGER NOT NULL,
    "created_at" TEXT NOT NULL,

    CONSTRAINT "ShoppingList_pkey" PRIMARY KEY ("list_id")
);

-- CreateTable
CREATE TABLE "ShoppingListItem" (
    "item_id" SERIAL NOT NULL,
    "list_id" INTEGER NOT NULL,
    "food_item_id" INTEGER NOT NULL,
    "unit_id" INTEGER NOT NULL,
    "added_by_user_id" INTEGER NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "is_purchased" BOOLEAN NOT NULL DEFAULT false,
    "added_at" TEXT NOT NULL,

    CONSTRAINT "ShoppingListItem_pkey" PRIMARY KEY ("item_id")
);

-- CreateTable
CREATE TABLE "Recipe" (
    "recipe_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_by_user_id" INTEGER NOT NULL,

    CONSTRAINT "Recipe_pkey" PRIMARY KEY ("recipe_id")
);

-- CreateTable
CREATE TABLE "RecipeIngredient" (
    "recipe_ingredient_id" SERIAL NOT NULL,
    "recipe_id" INTEGER NOT NULL,
    "food_item_id" INTEGER NOT NULL,
    "unit_id" INTEGER NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "RecipeIngredient_pkey" PRIMARY KEY ("recipe_ingredient_id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "notification_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("notification_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ShoppingList_household_id_key" ON "ShoppingList"("household_id");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "Household"("household_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryEntry" ADD CONSTRAINT "InventoryEntry_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "Household"("household_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryEntry" ADD CONSTRAINT "InventoryEntry_food_item_id_fkey" FOREIGN KEY ("food_item_id") REFERENCES "FoodItem"("food_item_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryEntry" ADD CONSTRAINT "InventoryEntry_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "Unit"("unit_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryEntry" ADD CONSTRAINT "InventoryEntry_added_by_user_id_fkey" FOREIGN KEY ("added_by_user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealLog" ADD CONSTRAINT "MealLog_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealLogEntry" ADD CONSTRAINT "MealLogEntry_meal_log_id_fkey" FOREIGN KEY ("meal_log_id") REFERENCES "MealLog"("meal_log_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealLogEntry" ADD CONSTRAINT "MealLogEntry_food_item_id_fkey" FOREIGN KEY ("food_item_id") REFERENCES "FoodItem"("food_item_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealLogEntry" ADD CONSTRAINT "MealLogEntry_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "Unit"("unit_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShoppingList" ADD CONSTRAINT "ShoppingList_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "Household"("household_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShoppingListItem" ADD CONSTRAINT "ShoppingListItem_list_id_fkey" FOREIGN KEY ("list_id") REFERENCES "ShoppingList"("list_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShoppingListItem" ADD CONSTRAINT "ShoppingListItem_food_item_id_fkey" FOREIGN KEY ("food_item_id") REFERENCES "FoodItem"("food_item_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShoppingListItem" ADD CONSTRAINT "ShoppingListItem_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "Unit"("unit_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShoppingListItem" ADD CONSTRAINT "ShoppingListItem_added_by_user_id_fkey" FOREIGN KEY ("added_by_user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recipe" ADD CONSTRAINT "Recipe_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeIngredient" ADD CONSTRAINT "RecipeIngredient_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "Recipe"("recipe_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeIngredient" ADD CONSTRAINT "RecipeIngredient_food_item_id_fkey" FOREIGN KEY ("food_item_id") REFERENCES "FoodItem"("food_item_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeIngredient" ADD CONSTRAINT "RecipeIngredient_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "Unit"("unit_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
