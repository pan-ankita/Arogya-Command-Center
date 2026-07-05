import { pgTable, serial, timestamp, integer, doublePrecision, json, pgEnum } from "drizzle-orm/pg-core";
import { facilitiesTable } from "./facilities";

export const performanceStatusEnum = pgEnum("performance_status", ["healthy", "watch", "critical"]);

export const performanceFlagsTable = pgTable("performance_flags", {
  id: serial("id").primaryKey(),
  facilityId: integer("facility_id").notNull().references(() => facilitiesTable.id),
  compositeScore: doublePrecision("composite_score").notNull(),
  reasonBreakdown: json("reason_breakdown"),
  status: performanceStatusEnum("status").notNull(),
  flaggedAt: timestamp("flagged_at", { withTimezone: true }).notNull().defaultNow(),
});

export type PerformanceFlag = typeof performanceFlagsTable.$inferSelect;
