CREATE TABLE IF NOT EXISTS `transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL,
	`amount` real NOT NULL,
	`type` text NOT NULL,
	`category` text DEFAULT '' NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`originalText` text DEFAULT '' NOT NULL
);