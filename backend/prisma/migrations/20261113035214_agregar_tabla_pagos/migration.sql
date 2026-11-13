/*
  Warnings:

  - You are about to drop the column `aspiranteId` on the `pago` table. All the data in the column will be lost.
  - You are about to drop the column `creadoEn` on the `pago` table. All the data in the column will be lost.
  - You are about to drop the column `referenciaBancaria` on the `pago` table. All the data in the column will be lost.
  - Added the required column `aspirante_id` to the `pago` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `pago` DROP FOREIGN KEY `pago_aspiranteId_fkey`;

-- DropIndex
DROP INDEX `pago_referenciaBancaria_key` ON `pago`;

-- AlterTable
ALTER TABLE `pago` DROP COLUMN `aspiranteId`,
    DROP COLUMN `creadoEn`,
    DROP COLUMN `referenciaBancaria`,
    ADD COLUMN `aspirante_id` INTEGER NOT NULL,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `concepto` VARCHAR(150) NOT NULL,
    MODIFY `fechaPago` VARCHAR(20) NOT NULL,
    ALTER COLUMN `metodo` DROP DEFAULT;

-- CreateTable
CREATE TABLE `actas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(150) NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `actas_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `pago` ADD CONSTRAINT `pago_aspirante_id_fkey` FOREIGN KEY (`aspirante_id`) REFERENCES `aspirante`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
