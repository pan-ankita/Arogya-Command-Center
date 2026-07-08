CREATE TYPE "public"."facility_type" AS ENUM('PHC', 'CHC', 'SDH', 'DH');--> statement-breakpoint
CREATE TYPE "public"."health_status" AS ENUM('healthy', 'watch', 'critical');--> statement-breakpoint
CREATE TYPE "public"."lang_pref" AS ENUM('en', 'hi', 'bn');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('facility_staff', 'district_admin', 'citizen');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('restock', 'consumption', 'transfer_in', 'transfer_out');--> statement-breakpoint
CREATE TYPE "public"."attendance_status" AS ENUM('present', 'absent', 'late');--> statement-breakpoint
CREATE TYPE "public"."test_status" AS ENUM('available', 'unavailable', 'equipment_down');--> statement-breakpoint
CREATE TYPE "public"."calamity_severity" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "public"."calamity_type" AS ENUM('flood', 'fire', 'outbreak', 'infrastructure', 'other');--> statement-breakpoint
CREATE TYPE "public"."redist_priority" AS ENUM('normal', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."redist_status" AS ENUM('pending', 'accepted', 'rejected', 'completed');--> statement-breakpoint
CREATE TYPE "public"."alert_severity" AS ENUM('info', 'warning', 'critical');--> statement-breakpoint
CREATE TYPE "public"."performance_status" AS ENUM('healthy', 'watch', 'critical');--> statement-breakpoint
CREATE TABLE "districts" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"state" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "facilities" (
	"id" serial PRIMARY KEY NOT NULL,
	"district_id" integer NOT NULL,
	"name" text NOT NULL,
	"type" "facility_type" NOT NULL,
	"address" text NOT NULL,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"phone" text,
	"incharge_name" text,
	"total_bed_capacity" integer DEFAULT 30 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"facility_id" integer,
	"name" text NOT NULL,
	"username" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" "user_role" NOT NULL,
	"language_pref" "lang_pref" DEFAULT 'en' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "medicines" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"unit" text NOT NULL,
	"reorder_threshold_days" integer DEFAULT 7 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stock_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"facility_id" integer NOT NULL,
	"medicine_id" integer NOT NULL,
	"current_quantity" double precision DEFAULT 0 NOT NULL,
	"avg_daily_consumption" double precision DEFAULT 1 NOT NULL,
	"last_updated_by" integer,
	"last_updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stock_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"facility_id" integer NOT NULL,
	"medicine_id" integer NOT NULL,
	"type" "transaction_type" NOT NULL,
	"quantity" double precision NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "patient_footfall" (
	"id" serial PRIMARY KEY NOT NULL,
	"facility_id" integer NOT NULL,
	"department" text NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	"log_date" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "beds" (
	"id" serial PRIMARY KEY NOT NULL,
	"facility_id" integer NOT NULL,
	"ward_name" text NOT NULL,
	"total_beds" integer NOT NULL,
	"occupied_beds" integer DEFAULT 0 NOT NULL,
	"last_updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "doctor_attendance" (
	"id" serial PRIMARY KEY NOT NULL,
	"doctor_id" integer NOT NULL,
	"facility_id" integer NOT NULL,
	"attendance_date" date NOT NULL,
	"status" "attendance_status" NOT NULL,
	"check_in_time" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "doctors" (
	"id" serial PRIMARY KEY NOT NULL,
	"facility_id" integer NOT NULL,
	"name" text NOT NULL,
	"specialization" text NOT NULL,
	"scheduled_days" text DEFAULT 'Mon,Tue,Wed,Thu,Fri' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "test_availability" (
	"id" serial PRIMARY KEY NOT NULL,
	"facility_id" integer NOT NULL,
	"test_id" integer NOT NULL,
	"status" "test_status" DEFAULT 'available' NOT NULL,
	"last_checked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tests" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "calamity_alerts" (
	"id" serial PRIMARY KEY NOT NULL,
	"facility_id" integer NOT NULL,
	"type" "calamity_type" NOT NULL,
	"severity" "calamity_severity" NOT NULL,
	"description" text,
	"triggered_by" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"triggered_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "redistribution_recommendations" (
	"id" serial PRIMARY KEY NOT NULL,
	"resource_type" text DEFAULT 'medicine' NOT NULL,
	"medicine_id" integer,
	"source_facility_id" integer NOT NULL,
	"target_facility_id" integer NOT NULL,
	"suggested_quantity" double precision NOT NULL,
	"distance_km" double precision,
	"reasoning_text" text,
	"priority" "redist_priority" DEFAULT 'normal' NOT NULL,
	"status" "redist_status" DEFAULT 'pending' NOT NULL,
	"generated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alerts" (
	"id" serial PRIMARY KEY NOT NULL,
	"facility_id" integer,
	"type" text NOT NULL,
	"severity" "alert_severity" DEFAULT 'info' NOT NULL,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "performance_flags" (
	"id" serial PRIMARY KEY NOT NULL,
	"facility_id" integer NOT NULL,
	"composite_score" double precision NOT NULL,
	"reason_breakdown" json,
	"status" "performance_status" NOT NULL,
	"flagged_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "complaints" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"description" text NOT NULL,
	"image_url" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "facilities" ADD CONSTRAINT "facilities_district_id_districts_id_fk" FOREIGN KEY ("district_id") REFERENCES "public"."districts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_facility_id_facilities_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_records" ADD CONSTRAINT "stock_records_facility_id_facilities_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_records" ADD CONSTRAINT "stock_records_medicine_id_medicines_id_fk" FOREIGN KEY ("medicine_id") REFERENCES "public"."medicines"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_records" ADD CONSTRAINT "stock_records_last_updated_by_users_id_fk" FOREIGN KEY ("last_updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_transactions" ADD CONSTRAINT "stock_transactions_facility_id_facilities_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_transactions" ADD CONSTRAINT "stock_transactions_medicine_id_medicines_id_fk" FOREIGN KEY ("medicine_id") REFERENCES "public"."medicines"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_footfall" ADD CONSTRAINT "patient_footfall_facility_id_facilities_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "beds" ADD CONSTRAINT "beds_facility_id_facilities_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctor_attendance" ADD CONSTRAINT "doctor_attendance_doctor_id_doctors_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctor_attendance" ADD CONSTRAINT "doctor_attendance_facility_id_facilities_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_facility_id_facilities_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_availability" ADD CONSTRAINT "test_availability_facility_id_facilities_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_availability" ADD CONSTRAINT "test_availability_test_id_tests_id_fk" FOREIGN KEY ("test_id") REFERENCES "public"."tests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calamity_alerts" ADD CONSTRAINT "calamity_alerts_facility_id_facilities_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calamity_alerts" ADD CONSTRAINT "calamity_alerts_triggered_by_users_id_fk" FOREIGN KEY ("triggered_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "redistribution_recommendations" ADD CONSTRAINT "redistribution_recommendations_medicine_id_medicines_id_fk" FOREIGN KEY ("medicine_id") REFERENCES "public"."medicines"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "redistribution_recommendations" ADD CONSTRAINT "redistribution_recommendations_source_facility_id_facilities_id_fk" FOREIGN KEY ("source_facility_id") REFERENCES "public"."facilities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "redistribution_recommendations" ADD CONSTRAINT "redistribution_recommendations_target_facility_id_facilities_id_fk" FOREIGN KEY ("target_facility_id") REFERENCES "public"."facilities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_facility_id_facilities_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "performance_flags" ADD CONSTRAINT "performance_flags_facility_id_facilities_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE no action ON UPDATE no action;