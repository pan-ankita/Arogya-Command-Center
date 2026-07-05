import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";

export const districtsTable = pgTable("districts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  state: text("state").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type District = typeof districtsTable.$inferSelect;
