import { pgTable, text, serial, timestamp, integer, doublePrecision, pgEnum } from "drizzle-orm/pg-core";
import { districtsTable } from "./districts";

export const facilityTypeEnum = pgEnum("facility_type", ["PHC", "CHC", "SDH", "DH"]);
export const healthStatusEnum = pgEnum("health_status", ["healthy", "watch", "critical"]);

export const facilitiesTable = pgTable("facilities", {
  id: serial("id").primaryKey(),
  districtId: integer("district_id").notNull().references(() => districtsTable.id),
  name: text("name").notNull(),
  type: facilityTypeEnum("type").notNull(),
  address: text("address").notNull(),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  phone: text("phone"),
  inchargeName: text("incharge_name"),
  totalBedCapacity: integer("total_bed_capacity").notNull().default(30),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Facility = typeof facilitiesTable.$inferSelect;
