import { pgTable, serial, timestamp, integer, text, pgEnum, date } from "drizzle-orm/pg-core";
import { facilitiesTable } from "./facilities";

export const attendanceStatusEnum = pgEnum("attendance_status", ["present", "absent", "late"]);

export const doctorsTable = pgTable("doctors", {
  id: serial("id").primaryKey(),
  facilityId: integer("facility_id").notNull().references(() => facilitiesTable.id),
  name: text("name").notNull(),
  specialization: text("specialization").notNull(),
  scheduledDays: text("scheduled_days").notNull().default("Mon,Tue,Wed,Thu,Fri"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const doctorAttendanceTable = pgTable("doctor_attendance", {
  id: serial("id").primaryKey(),
  doctorId: integer("doctor_id").notNull().references(() => doctorsTable.id),
  facilityId: integer("facility_id").notNull().references(() => facilitiesTable.id),
  attendanceDate: date("attendance_date", { mode: "string" }).notNull(),
  status: attendanceStatusEnum("status").notNull(),
  checkInTime: text("check_in_time"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Doctor = typeof doctorsTable.$inferSelect;
export type DoctorAttendance = typeof doctorAttendanceTable.$inferSelect;
