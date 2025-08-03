CREATE TABLE "analytics_data" (
	"id" text PRIMARY KEY NOT NULL,
	"device_id" text NOT NULL,
	"timestamp" timestamp NOT NULL,
	"total_requests" integer DEFAULT 0 NOT NULL,
	"direct_count" integer DEFAULT 0 NOT NULL,
	"proxy_count" integer DEFAULT 0 NOT NULL,
	"blocked_count" integer DEFAULT 0 NOT NULL,
	"domain_stats" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "device_configs" (
	"device_id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"worker_config" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "family_profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"user_id" text NOT NULL,
	"restrictions" text,
	"allowed_domains" text,
	"blocked_domains" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "proxy_endpoints" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"url" varchar(512) NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "routing_rules" (
	"id" text PRIMARY KEY NOT NULL,
	"domain" varchar(255) NOT NULL,
	"action" varchar(50) NOT NULL,
	"region" varchar(100),
	"priority" integer DEFAULT 0 NOT NULL,
	"description" text,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "analytics_data" ADD CONSTRAINT "analytics_data_device_id_device_configs_device_id_fk" FOREIGN KEY ("device_id") REFERENCES "public"."device_configs"("device_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "device_configs" ADD CONSTRAINT "device_configs_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "family_profiles" ADD CONSTRAINT "family_profiles_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;