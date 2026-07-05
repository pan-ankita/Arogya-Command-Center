import { pgTable, serial, text, timestamp, integer, doublePrecision, pgEnum } from "drizzle-orm/pg-core";
import { facilitiesTable } from "./facilities";
import { medicinesTable } from "./medicines";

export const redistPriorityEnum = pgEnum("redist_priority", ["normal", "high", "critical"]);
export const redistStatusEnum = pgEnum("redist_status", ["pending", "accepted", "rejected", "completed"]);

export const redistribRecommendationsTable = pgTable("redistribution_recommendations", {
  id: serial("id").primaryKey(),
  resourceType: text("resource_type").notNull().default("medicine"),
  medicineId: integer("medicine_id").references(() => medicinesTable.id),
  sourceFacilityId: integer("source_facility_id").notNull().references(() => facilitiesTable.id),
  targetFacilityId: integer("target_facility_id").notNull().references(() => facilitiesTable.id),
  suggestedQuantity: doublePrecision("suggested_quantity").notNull(),
  distanceKm: doublePrecision("distance_km"),
  reasoningText: text("reasoning_text"),
  priority: redistPriorityEnum("priority").notNull().default("normal"),
  status: redistStatusEnum("status").notNull().default("pending"),
  generatedAt: timestamp("generated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type RedistribRecommendation = typeof redistribRecommendationsTable.$inferSelect;
