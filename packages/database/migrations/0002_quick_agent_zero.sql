CREATE TABLE "family_allow_lists" (
	"id" text PRIMARY KEY NOT NULL,
	"family_id" text NOT NULL,
	"user_id" text NOT NULL,
	"allowed_applications" text,
	"preset_mode" varchar(50) DEFAULT 'custom',
	"list_version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "preset_allow_lists" (
	"id" text PRIMARY KEY NOT NULL,
	"mode_name" varchar(50) NOT NULL,
	"applications" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "family_allow_lists" ADD CONSTRAINT "family_allow_lists_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;