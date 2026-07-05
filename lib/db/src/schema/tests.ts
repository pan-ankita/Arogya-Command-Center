import { pgTable, serial, text, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";
import { facilitiesTable } from "./facilities";

export const testStatusEnum = pgEnum("test_status", ["available", "unavailable", "equipment_down"]);

export const testsTable = pgTable("tests", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const testAvailabilityTable = pgTable("test_availability", {
  id: serial("id").primaryKey(),
  facilityId: integer("facility_id").notNull().references(() => facilitiesTable.id),
  testId: integer("test_id").notNull().references(() => testsTable.id),
  status: testStatusEnum("status").notNull().default("available"),
  lastCheckedAt: timestamp("last_checked_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Test = typeof testsTable.$inferSelect;
export type TestAvailability = typeof testAvailabilityTable.$inferSelect;
