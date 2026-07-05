import { pgTable, serial, timestamp, integer, doublePrecision, text, pgEnum } from "drizzle-orm/pg-core";
import { facilitiesTable } from "./facilities";
import { medicinesTable } from "./medicines";
import { usersTable } from "./users";

export const transactionTypeEnum = pgEnum("transaction_type", ["restock", "consumption", "transfer_in", "transfer_out"]);

export const stockRecordsTable = pgTable("stock_records", {
  id: serial("id").primaryKey(),
  facilityId: integer("facility_id").notNull().references(() => facilitiesTable.id),
  medicineId: integer("medicine_id").notNull().references(() => medicinesTable.id),
  currentQuantity: doublePrecision("current_quantity").notNull().default(0),
  avgDailyConsumption: doublePrecision("avg_daily_consumption").notNull().default(1),
  lastUpdatedBy: integer("last_updated_by").references(() => usersTable.id),
  lastUpdatedAt: timestamp("last_updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const stockTransactionsTable = pgTable("stock_transactions", {
  id: serial("id").primaryKey(),
  facilityId: integer("facility_id").notNull().references(() => facilitiesTable.id),
  medicineId: integer("medicine_id").notNull().references(() => medicinesTable.id),
  type: transactionTypeEnum("type").notNull(),
  quantity: doublePrecision("quantity").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type StockRecord = typeof stockRecordsTable.$inferSelect;
export type StockTransaction = typeof stockTransactionsTable.$inferSelect;
