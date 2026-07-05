import { pgTable, serial, timestamp, integer, date } from "drizzle-orm/pg-core";
import { facilitiesTable } from "./facilities";
import { text } from "drizzle-orm/pg-core";

export const patientFootfallTable = pgTable("patient_footfall", {
  id: serial("id").primaryKey(),
  facilityId: integer("facility_id").notNull().references(() => facilitiesTable.id),
  department: text("department").notNull(),
  count: integer("count").notNull().default(0),
  logDate: date("log_date", { mode: "string" }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type PatientFootfall = typeof patientFootfallTable.$inferSelect;
