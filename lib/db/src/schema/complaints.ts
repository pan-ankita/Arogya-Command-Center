import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const complaintsTable = pgTable("complaints", {
  id: serial("id").primaryKey(),

  email: text("email").notNull(),

  description: text("description").notNull(),

  imageUrl: text("image_url"),

  status: text("status").notNull().default("pending"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});