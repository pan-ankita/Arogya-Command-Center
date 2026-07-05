import { pgTable, serial, timestamp, integer, text } from "drizzle-orm/pg-core";
import { facilitiesTable } from "./facilities";

export const bedsTable = pgTable("beds", {
  id: serial("id").primaryKey(),
  facilityId: integer("facility_id").notNull().references(() => facilitiesTable.id),
  wardName: text("ward_name").notNull(),
  totalBeds: integer("total_beds").notNull(),
  occupiedBeds: integer("occupied_beds").notNull().default(0),
  lastUpdatedAt: timestamp("last_updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Bed = typeof bedsTable.$inferSelect;
