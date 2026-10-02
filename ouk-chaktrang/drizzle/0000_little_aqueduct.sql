CREATE TABLE `rooms` (
	`id` text PRIMARY KEY NOT NULL,
	`state_json` text NOT NULL,
	`white_seat` text,
	`black_seat` text,
	`revision` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
