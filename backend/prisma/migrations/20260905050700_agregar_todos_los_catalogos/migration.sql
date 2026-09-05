-- CreateTable
CREATE TABLE `aspirantes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `folio` VARCHAR(191) NOT NULL,
    `vigenciaFolio` DATETIME(3) NOT NULL,
    `apellidoPaterno` VARCHAR(191) NOT NULL,
    `apellidoMaterno` VARCHAR(191) NULL,
    `nombres` VARCHAR(191) NOT NULL,
    `curp` VARCHAR(191) NOT NULL,
    `correoElectronico1` VARCHAR(191) NOT NULL,
    `correoElectronico2` VARCHAR(191) NULL,
    `telefonoCelular` VARCHAR(191) NOT NULL,
    `telefonoParticular` VARCHAR(191) NULL,
    `generoIdentidad` VARCHAR(191) NULL,
    `identidadCultural` VARCHAR(191) NULL,
    `tieneDiscapacidad` VARCHAR(191) NOT NULL DEFAULT 'NO',
    `apoyoEducativo` VARCHAR(191) NOT NULL DEFAULT 'NO',
    `situacionLaboral` VARCHAR(191) NULL,
    `cuentaComputadora` VARCHAR(191) NOT NULL DEFAULT 'SÍ',
    `cuentaInternet` VARCHAR(191) NOT NULL DEFAULT 'SÍ',
    `medioEnterado` VARCHAR(191) NULL,
    `pais` VARCHAR(191) NOT NULL DEFAULT 'MÉXICO',
    `codigoPostal` VARCHAR(191) NOT NULL,
    `estado` VARCHAR(191) NOT NULL,
    `municipio` VARCHAR(191) NOT NULL,
    `colonia` VARCHAR(191) NOT NULL,
    `calle` VARCHAR(191) NOT NULL,
    `numeroExterior` VARCHAR(191) NULL,
    `numeroInterior` VARCHAR(191) NULL,
    `tutorApellidoPaterno` VARCHAR(191) NULL,
    `tutorApellidoMaterno` VARCHAR(191) NULL,
    `tutorNombres` VARCHAR(191) NULL,
    `tutorParentesco` VARCHAR(191) NULL,
    `tutorTelefono` VARCHAR(191) NULL,
    `tipoAdmision` VARCHAR(191) NOT NULL DEFAULT 'nuevo_ingreso',
    `tipoSecundaria` VARCHAR(191) NULL,
    `cctEscuelaProcedencia` VARCHAR(191) NULL,
    `nombreEscuelaProcedencia` VARCHAR(191) NULL,
    `estadoEscuelaProcedencia` VARCHAR(191) NULL,
    `promedioSecundaria` VARCHAR(191) NULL,
    `sistemaBachilleratoPrevio` VARCHAR(191) NULL,
    `otroSistemaProcedencia` VARCHAR(191) NULL,
    `cctBachilleratoPrevio` VARCHAR(191) NULL,
    `nombreBachilleratoPrevio` VARCHAR(191) NULL,
    `estadoBachilleratoPrevio` VARCHAR(191) NULL,
    `tipoEstudiante` VARCHAR(191) NULL,
    `semestreActual` VARCHAR(191) NULL,
    `planEstudios` VARCHAR(191) NULL,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoEn` DATETIME(3) NOT NULL,

    UNIQUE INDEX `aspirantes_folio_key`(`folio`),
    UNIQUE INDEX `aspirantes_curp_key`(`curp`),
    UNIQUE INDEX `aspirantes_correoElectronico1_key`(`correoElectronico1`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `documentos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `aspiranteId` INTEGER NOT NULL,
    `tipoDoc` VARCHAR(191) NOT NULL,
    `nombreArchivo` VARCHAR(191) NOT NULL,
    `rutaArchivo` VARCHAR(191) NOT NULL,
    `estatusDoc` VARCHAR(191) NOT NULL DEFAULT 'EN REVISIÓN',
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tipos_secundaria_catalog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(150) NOT NULL,
    `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `tipos_secundaria_catalog_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subsistemas_bachillerato_catalog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(150) NOT NULL,
    `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `subsistemas_bachillerato_catalog_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `medios_enterado_catalog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(150) NOT NULL,
    `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `medios_enterado_catalog_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `genero_identidad_catalog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(150) NOT NULL,
    `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `genero_identidad_catalog_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `identidad_cultural_catalog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(150) NOT NULL,
    `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `identidad_cultural_catalog_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `situacion_laboral_catalog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(150) NOT NULL,
    `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `situacion_laboral_catalog_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `documentos` ADD CONSTRAINT `documentos_aspiranteId_fkey` FOREIGN KEY (`aspiranteId`) REFERENCES `aspirantes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
