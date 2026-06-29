-- NestJS roadmap progress

CREATE TABLE `RoadmapDayProgress` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `roadmapId` VARCHAR(191) NOT NULL DEFAULT 'nestjs-30-day',
    `dayNumber` INTEGER NOT NULL,
    `blocks` JSON NOT NULL,
    `notes` TEXT NULL,
    `builtItems` TEXT NULL,
    `learnNotes` TEXT NULL,
    `dayCompleted` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `RoadmapDayProgress_userId_roadmapId_idx`(`userId`, `roadmapId`),
    UNIQUE INDEX `RoadmapDayProgress_userId_roadmapId_dayNumber_key`(`userId`, `roadmapId`, `dayNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `RoadmapDayProgress` ADD CONSTRAINT `RoadmapDayProgress_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
