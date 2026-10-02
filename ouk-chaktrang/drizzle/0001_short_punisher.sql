CREATE TABLE `room_comments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`room_id` text NOT NULL,
	`author_hash` text NOT NULL,
	`client_id` text NOT NULL,
	`role` text NOT NULL,
	`visitor_tag` text NOT NULL,
	`message` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_comments_room_id` ON `room_comments` (`room_id`,`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_comments_retry` ON `room_comments` (`room_id`,`author_hash`,`client_id`);