/*
  Warnings:

  - You are about to drop the column `genero` on the `aspirante` table. All the data in the column will be lost.
  - You are about to drop the column `nivel` on the `auditoria` table. All the data in the column will be lost.
  - You are about to drop the `control_escolar` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `control_escolar` DROP FOREIGN KEY `control_escolar_aspiranteId_fkey`;

-- AlterTable
ALTER TABLE `aspirante` DROP COLUMN `genero`;

-- AlterTable
ALTER TABLE `auditoria` DROP COLUMN `nivel`,
    ADD COLUMN `level` VARCHAR(50) NOT NULL DEFAULT 'Informativo';

-- DropTable
DROP TABLE `control_escolar`;

-- CreateTable
CREATE TABLE `validacion_expedientes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `aspiranteId` INTEGER NOT NULL,
    `dictamenGeneral` VARCHAR(50) NOT NULL DEFAULT 'PENDIENTE',
    `observaciones` TEXT NULL,
    `validadoPor` VARCHAR(50) NULL,
    `fechaValidacion` DATETIME(3) NULL,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `validacion_expedientes_aspiranteId_key`(`aspiranteId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `validacion_expedientes` ADD CONSTRAINT `validacion_expedientes_aspiranteId_fkey` FOREIGN KEY (`aspiranteId`) REFERENCES `aspirante`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
