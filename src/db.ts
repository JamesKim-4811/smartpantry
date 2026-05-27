import initSqlJs, { Database } from "sql.js";
import * as fs from "fs";
import * as path from "path";

const DB_PATH = path.join(__dirname, "..", "smartpantry.db");

let db: Database;

export async function initDb(): Promise<Database> {
  const SQL = await initSqlJs();

  // Load existing DB from disk if it exists, otherwise create fresh
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  createTables();
  seedData();
  saveDb();

  console.log("✅ Database initialized");
  return db;
}

// Call this after any write operation to persist to disk
export function saveDb(): void {
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

export function getDb(): Database {
  if (!db) throw new Error("Database not initialized. Call initDb() first.");
  return db;
}

function createTables(): void {
  db.run(`
    CREATE TABLE IF NOT EXISTS Household (
      household_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS User (
      user_id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('Admin', 'Member', 'Viewer')),
      household_id INTEGER NOT NULL,
      FOREIGN KEY (household_id) REFERENCES Household(household_id)
    );

    CREATE TABLE IF NOT EXISTS FoodItem (
      food_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      calories_per_unit REAL,
      protein_per_unit REAL,
      carbs_per_unit REAL,
      fat_per_unit REAL
    );

    CREATE TABLE IF NOT EXISTS Unit (
      unit_id INTEGER PRIMARY KEY AUTOINCREMENT,
      unit_name TEXT NOT NULL,
      unit_type TEXT
    );

    CREATE TABLE IF NOT EXISTS InventoryEntry (
      entry_id INTEGER PRIMARY KEY AUTOINCREMENT,
      household_id INTEGER NOT NULL,
      food_item_id INTEGER NOT NULL,
      unit_id INTEGER NOT NULL,
      added_by_user_id INTEGER NOT NULL,
      quantity REAL NOT NULL,
      purchase_date TEXT NOT NULL,
      expiration_date TEXT,
      storage_location TEXT NOT NULL CHECK(storage_location IN ('fridge', 'pantry', 'freezer')),
      FOREIGN KEY (household_id) REFERENCES Household(household_id),
      FOREIGN KEY (food_item_id) REFERENCES FoodItem(food_item_id),
      FOREIGN KEY (unit_id) REFERENCES Unit(unit_id),
      FOREIGN KEY (added_by_user_id) REFERENCES User(user_id)
    );

    CREATE TABLE IF NOT EXISTS MealLog (
      meal_log_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      logged_at TEXT NOT NULL,
      notes TEXT,
      FOREIGN KEY (user_id) REFERENCES User(user_id)
    );

    CREATE TABLE IF NOT EXISTS MealLogEntry (
      entry_id INTEGER PRIMARY KEY AUTOINCREMENT,
      meal_log_id INTEGER NOT NULL,
      food_item_id INTEGER NOT NULL,
      unit_id INTEGER NOT NULL,
      quantity REAL NOT NULL,
      FOREIGN KEY (meal_log_id) REFERENCES MealLog(meal_log_id),
      FOREIGN KEY (food_item_id) REFERENCES FoodItem(food_item_id),
      FOREIGN KEY (unit_id) REFERENCES Unit(unit_id)
    );

    CREATE TABLE IF NOT EXISTS ShoppingList (
      list_id INTEGER PRIMARY KEY AUTOINCREMENT,
      household_id INTEGER NOT NULL UNIQUE,
      created_at TEXT NOT NULL,
      FOREIGN KEY (household_id) REFERENCES Household(household_id)
    );

    CREATE TABLE IF NOT EXISTS ShoppingListItem (
      item_id INTEGER PRIMARY KEY AUTOINCREMENT,
      list_id INTEGER NOT NULL,
      food_item_id INTEGER NOT NULL,
      unit_id INTEGER NOT NULL,
      added_by_user_id INTEGER NOT NULL,
      quantity REAL NOT NULL,
      is_purchased INTEGER NOT NULL DEFAULT 0,
      added_at TEXT NOT NULL,
      FOREIGN KEY (list_id) REFERENCES ShoppingList(list_id),
      FOREIGN KEY (food_item_id) REFERENCES FoodItem(food_item_id),
      FOREIGN KEY (unit_id) REFERENCES Unit(unit_id),
      FOREIGN KEY (added_by_user_id) REFERENCES User(user_id)
    );

    CREATE TABLE IF NOT EXISTS Recipe (
      recipe_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      created_by_user_id INTEGER NOT NULL,
      FOREIGN KEY (created_by_user_id) REFERENCES User(user_id)
    );

    CREATE TABLE IF NOT EXISTS RecipeIngredient (
      recipe_ingredient_id INTEGER PRIMARY KEY AUTOINCREMENT,
      recipe_id INTEGER NOT NULL,
      food_item_id INTEGER NOT NULL,
      unit_id INTEGER NOT NULL,
      quantity REAL NOT NULL,
      FOREIGN KEY (recipe_id) REFERENCES Recipe(recipe_id),
      FOREIGN KEY (food_item_id) REFERENCES FoodItem(food_item_id),
      FOREIGN KEY (unit_id) REFERENCES Unit(unit_id)
    );

    CREATE TABLE IF NOT EXISTS Notification (
      notification_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL,
      is_read INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES User(user_id)
    );
  `);
}

function seedData(): void {
  // Only seed if tables are empty
  const result = db.exec("SELECT COUNT(*) as count FROM Household");
  const count = result[0]?.values[0]?.[0] as number;
  if (count > 0) return;

  console.log("🌱 Seeding initial data...");

  db.run(`INSERT INTO Household (name) VALUES ('The Johnson Household')`);

  db.run(`INSERT INTO User (first_name, last_name, email, password_hash, role, household_id) VALUES
    ('Sarah', 'Johnson', 'sarah.johnson@email.com', 'hash1', 'Admin', 1),
    ('Mike', 'Johnson', 'mike.johnson@email.com', 'hash2', 'Member', 1),
    ('Emma', 'Johnson', 'emma.johnson@email.com', 'hash3', 'Member', 1),
    ('Dr. Lisa', 'Chen', 'lisa.chen@email.com', 'hash4', 'Viewer', 1)`);

  db.run(`INSERT INTO Unit (unit_name, unit_type) VALUES
    ('grams', 'weight'),
    ('kg', 'weight'),
    ('ml', 'volume'),
    ('liters', 'volume'),
    ('pieces', 'count'),
    ('slices', 'count'),
    ('cups', 'volume'),
    ('oz', 'weight')`);

  db.run(`INSERT INTO FoodItem (name, calories_per_unit, protein_per_unit, carbs_per_unit, fat_per_unit) VALUES
    ('Chicken Breast', 1.65, 0.31, 0.0, 0.036),
    ('Whole Milk', 61.0, 3.2, 4.8, 3.3),
    ('Eggs', 78.0, 6.0, 0.6, 5.0),
    ('Bread', 79.0, 2.7, 15.0, 1.0),
    ('Cheddar Cheese', 0.402, 0.025, 0.001, 0.033),
    ('Greek Yogurt', 59.0, 10.0, 3.6, 0.4),
    ('Spinach', 0.23, 0.029, 0.036, 0.004),
    ('Brown Rice', 1.3, 0.026, 0.28, 0.01),
    ('Olive Oil', 8.84, 0.0, 0.0, 1.0),
    ('Pasta', 1.31, 0.05, 0.25, 0.011),
    ('Canned Tomatoes', 0.45, 0.018, 0.097, 0.005),
    ('Bananas', 89.0, 1.1, 23.0, 0.3),
    ('Apples', 52.0, 0.3, 14.0, 0.2),
    ('Butter', 7.17, 0.008, 0.001, 0.81),
    ('Frozen Peas', 0.81, 0.054, 0.141, 0.004)`);

  const today = new Date().toISOString().split("T")[0];
  const future = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split("T")[0];
  };

  db.run(`INSERT INTO InventoryEntry (household_id, food_item_id, unit_id, added_by_user_id, quantity, purchase_date, expiration_date, storage_location) VALUES
    (1, 1, 5, 1, 2.0, '${today}', '${future(5)}', 'fridge'),
    (1, 2, 4, 2, 1.0, '${today}', '${future(7)}', 'fridge'),
    (1, 3, 5, 1, 12.0, '${today}', '${future(14)}', 'fridge'),
    (1, 4, 6, 2, 8.0, '${today}', '${future(3)}', 'fridge'),
    (1, 5, 1, 1, 200.0, '${today}', '${future(30)}', 'fridge'),
    (1, 8, 1, 2, 500.0, '${today}', '${future(180)}', 'pantry'),
    (1, 9, 3, 1, 500.0, '${today}', '${future(365)}', 'pantry'),
    (1, 10, 1, 3, 400.0, '${today}', '${future(200)}', 'pantry')`);

  db.run(`INSERT INTO ShoppingList (household_id, created_at) VALUES (1, '${today} 10:00:00')`);

  db.run(`INSERT INTO ShoppingListItem (list_id, food_item_id, unit_id, added_by_user_id, quantity, is_purchased, added_at) VALUES
    (1, 2, 4, 2, 2.0, 0, '${today} 10:05:00'),
    (1, 3, 5, 1, 12.0, 0, '${today} 10:06:00'),
    (1, 4, 6, 3, 1.0, 0, '${today} 10:10:00'),
    (1, 12, 5, 2, 6.0, 1, '${today} 10:12:00')`);
}
