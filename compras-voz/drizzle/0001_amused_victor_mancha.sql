CREATE TABLE IF NOT EXISTS `accounts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`initialBalance` real DEFAULT 0 NOT NULL,
	`month` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `transactions` ADD `accountId` integer REFERENCES accounts(id);