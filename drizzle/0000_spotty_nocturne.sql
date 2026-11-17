CREATE TABLE `leads` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`destination` text NOT NULL,
	`purpose` text NOT NULL,
	`language` text NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`source` text DEFAULT 'direct' NOT NULL,
	`created_at` integer NOT NULL,
	`consent_version` text DEFAULT '2026-11-16' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `leads_created_idx` ON `leads` (`created_at`);--> statement-breakpoint
CREATE INDEX `leads_phone_idx` ON `leads` (`phone`);