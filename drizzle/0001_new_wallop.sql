CREATE TABLE `anime_sites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`url` varchar(512) NOT NULL,
	`description` text,
	`genre` enum('legal','unofficial') NOT NULL DEFAULT 'unofficial',
	`contentType` enum('subbed','dubbed','both') NOT NULL DEFAULT 'both',
	`status` enum('Active','Down','Unknown') NOT NULL DEFAULT 'Unknown',
	`lastChecked` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `anime_sites_id` PRIMARY KEY(`id`),
	CONSTRAINT `anime_sites_url_unique` UNIQUE(`url`)
);
