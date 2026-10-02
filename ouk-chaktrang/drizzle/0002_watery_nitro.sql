CREATE TABLE `profiles` (
	`guest_hash` text PRIMARY KEY NOT NULL,
	`display_name` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE `room_comments` ADD `author_name` text;--> statement-breakpoint
CREATE INDEX `idx_rooms_white_seat` ON `rooms` (`white_seat`);--> statement-breakpoint
CREATE INDEX `idx_rooms_black_seat` ON `rooms` (`black_seat`);