CREATE TABLE `audio_tracks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`original_filename` text NOT NULL,
	`original_path` text NOT NULL,
	`extended_paths` text DEFAULT '[]',
	`duration` integer,
	`extended_durations` text DEFAULT '[]',
	`bpm` integer,
	`key` text,
	`format` text,
	`bitrate` integer,
	`status` text DEFAULT 'uploaded' NOT NULL,
	`settings` text,
	`version_count` integer DEFAULT 1 NOT NULL,
	`user_id` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`password` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);