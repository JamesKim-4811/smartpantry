# SmartPantry

A household pantry management REST API. Track food inventory, meal logs, nutrition, shopping lists, and recipes across a household.

## Stack

- **Node.js + Express + TypeScript**
- **Prisma ORM** with SQLite (`prisma/smartpantry.db`)

## Setup

```bash
npm install
npm run db:migrate   # create/migrate the database
npm run db:seed      # populate with sample data (The Johnson Household)
npm run dev          # start dev server on http://localhost:3001
```

## Database

```bash
npm run db:studio    # open Prisma Studio at http://localhost:5555
npm run db:migrate   # run after any schema changes (prisma/schema.prisma)
```

## Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/households` | List all households |
| GET | `/api/households/:id/users` | Users in a household |
| GET | `/api/inventory/household/:id` | Full inventory |
| GET | `/api/inventory/household/:id/expiring?days=3` | Items expiring soon |
| GET | `/api/nutrition/household/:id` | Nutrition summary by member/day |
| GET | `/api/shopping-list/household/:id` | Shopping list |
| GET | `/api/recipes/suggestions/household/:id` | Recipes cookable from current stock |
| GET | `/api/users/:id/meal-logs` | Meal history for a user |
| GET | `/api/users/:id/notifications?unread=true` | User notifications |
| GET | `/api/food-items` | All food items |
| GET | `/api/units` | All units |

## Project Structure

```
src/
  index.ts          # app entry point
  db.ts             # Prisma client singleton
  routes/           # Express routers
  services/         # business logic
  repositories/     # Prisma queries
  models/           # TypeScript interfaces & input types
prisma/
  schema.prisma     # database schema
  seed.ts           # sample data
  smartpantry.db    # SQLite database file
```
