-- AlterTable
ALTER TABLE `aspirante` ADD COLUMN `subsistemaId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `aspirante` ADD CONSTRAINT `aspirante_subsistemaId_fkey` FOREIGN KEY (`subsistemaId`) REFERENCES `subsistema`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
