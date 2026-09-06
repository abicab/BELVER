/*
  Warnings:

  - You are about to drop the column `rutaArchivo` on the `documento` table. All the data in the column will be lost.
  - Added the required column `archivoBlob` to the `documento` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `documento` DROP COLUMN `rutaArchivo`,
    ADD COLUMN `archivoBlob` LONGBLOB NOT NULL;
