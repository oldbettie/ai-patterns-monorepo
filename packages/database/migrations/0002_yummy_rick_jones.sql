CREATE TYPE "public"."donation_tier" AS ENUM('supporter', 'supporter_plus', 'supporter_pro');--> statement-breakpoint
ALTER TABLE "donations" ADD COLUMN "tier" "donation_tier";