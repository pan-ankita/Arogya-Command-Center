import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";

export const medicinesTable = pgTable("medicines", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  unit: text("unit").notNull(),
  reorderThresholdDays: integer("reorder_threshold_days").notNull().default(7),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Medicine = typeof medicinesTable.$inferSelect;
