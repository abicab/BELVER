-- CreateTable
CREATE TABLE `catalogo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombreTabla` VARCHAR(191) NOT NULL,
    `tituloVisible` VARCHAR(191) NOT NULL,
    `orden` INTEGER NOT NULL DEFAULT 0,
    `activo` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `catalogo_nombreTabla_key`(`nombreTabla`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tipo_secundaria` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `tipo_secundaria_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subsistema` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `subsistema_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `medio_enterado` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `medio_enterado_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `genero` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `genero_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `identidad_cultural` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `identidad_cultural_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `situacion_laboral` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `situacion_laboral_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `discapacidad` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `discapacidad_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `parentesco` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `parentesco_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tipo_estudiante` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `tipo_estudiante_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `semestre` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `semestre_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `aspirante` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `folio` VARCHAR(191) NOT NULL,
    `vigenciaFolio` DATETIME(3) NULL,
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
    `tieneDiscapacidad` VARCHAR(191) NULL,
    `apoyoEducativo` VARCHAR(191) NULL,
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
    `tipoAdmision` VARCHAR(191) NOT NULL,
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
    `situacionLaboral` VARCHAR(191) NULL,
    `cuentaComputadora` VARCHAR(191) NULL,
    `cuentaInternet` VARCHAR(191) NULL,
    `medioEnterado` VARCHAR(191) NULL,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoEn` DATETIME(3) NOT NULL,

    UNIQUE INDEX `aspirante_folio_key`(`folio`),
    UNIQUE INDEX `aspirante_curp_key`(`curp`),
    UNIQUE INDEX `aspirante_correoElectronico1_key`(`correoElectronico1`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `documento` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `aspiranteId` INTEGER NOT NULL,
    `tipoDoc` VARCHAR(191) NOT NULL,
    `nombreArchivo` VARCHAR(191) NOT NULL,
    `rutaArchivo` VARCHAR(191) NOT NULL,
    `estatusDoc` VARCHAR(191) NOT NULL DEFAULT 'EN REVISIÓN',
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `documento` ADD CONSTRAINT `documento_aspiranteId_fkey` FOREIGN KEY (`aspiranteId`) REFERENCES `aspirante`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
