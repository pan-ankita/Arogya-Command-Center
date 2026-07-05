import { pgTable, serial, text, timestamp, integer, boolean, pgEnum } from "drizzle-orm/pg-core";
import { facilitiesTable } from "./facilities";

export const alertSeverityEnum = pgEnum("alert_severity", ["info", "warning", "critical"]);

export const alertsTable = pgTable("alerts", {
  id: serial("id").primaryKey(),
  facilityId: integer("facility_id").references(() => facilitiesTable.id),
  type: text("type").notNull(),
  severity: alertSeverityEnum("severity").notNull().default("info"),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Alert = typeof alertsTable.$inferSelect;
