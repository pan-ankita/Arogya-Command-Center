import { pgTable, serial, text, timestamp, integer, boolean, pgEnum } from "drizzle-orm/pg-core";
import { facilitiesTable } from "./facilities";
import { usersTable } from "./users";

export const calamityTypeEnum = pgEnum("calamity_type", ["flood", "fire", "outbreak", "infrastructure", "other"]);
export const calamitySeverityEnum = pgEnum("calamity_severity", ["low", "medium", "high"]);

export const calamityAlertsTable = pgTable("calamity_alerts", {
  id: serial("id").primaryKey(),
  facilityId: integer("facility_id").notNull().references(() => facilitiesTable.id),
  type: calamityTypeEnum("type").notNull(),
  severity: calamitySeverityEnum("severity").notNull(),
  description: text("description"),
  triggeredBy: integer("triggered_by").references(() => usersTable.id),
  isActive: boolean("is_active").notNull().default(true),
  triggeredAt: timestamp("triggered_at", { withTimezone: true }).notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
});

export type CalamityAlert = typeof calamityAlertsTable.$inferSelect;
