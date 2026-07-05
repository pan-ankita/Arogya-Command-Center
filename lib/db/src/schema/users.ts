import { pgTable, text, serial, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";
import { facilitiesTable } from "./facilities";

export const userRoleEnum = pgEnum("user_role", ["facility_staff", "district_admin", "citizen"]);
export const langPrefEnum = pgEnum("lang_pref", ["en", "hi", "bn"]);

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  facilityId: integer("facility_id").references(() => facilitiesTable.id),
  name: text("name").notNull(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: userRoleEnum("role").notNull(),
  languagePref: langPrefEnum("language_pref").notNull().default("en"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof usersTable.$inferSelect;
