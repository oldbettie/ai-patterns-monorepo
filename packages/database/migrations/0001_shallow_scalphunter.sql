CREATE TABLE "pendingDeviceRegistrations" (
	"token" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"deviceIdPrefix" text NOT NULL,
	"detectedDeviceId" text,
	"detectedName" text,
	"detectedPlatform" text,
	"userApproved" boolean DEFAULT false,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "clipboardItems" ADD COLUMN "isEncrypted" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "clipboardItems" ADD COLUMN "encryptionAlgorithm" text DEFAULT 'AES-256-GCM';--> statement-breakpoint
ALTER TABLE "devices" ADD COLUMN "apiKey" text;--> statement-breakpoint
ALTER TABLE "pendingDeviceRegistrations" ADD CONSTRAINT "pendingDeviceRegistrations_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devices" ADD CONSTRAINT "devices_apiKey_unique" UNIQUE("apiKey");