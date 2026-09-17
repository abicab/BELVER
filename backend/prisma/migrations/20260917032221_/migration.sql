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
    `activo` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `tipo_secundaria_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subsistema` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `subsistema_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `medio_enterado` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `medio_enterado_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `genero` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `genero_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `identidad_cultural` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `identidad_cultural_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `situacion_laboral` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `situacion_laboral_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `discapacidad` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `discapacidad_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `parentesco` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `parentesco_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tipo_estudiante` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `tipo_estudiante_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `semestre` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `semestre_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuario_admin` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `correo` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `nombres` VARCHAR(191) NOT NULL,
    `apellidos` VARCHAR(191) NOT NULL,
    `rol` VARCHAR(191) NOT NULL DEFAULT 'OPERADOR_ESCOLAR',
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `usuario_admin_correo_key`(`correo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `aspirante` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `folio` VARCHAR(191) NOT NULL,
    `vigenciaFolio` DATETIME(3) NULL,
    `matricula` VARCHAR(191) NULL,
    `password` VARCHAR(191) NULL,
    `rol` VARCHAR(191) NOT NULL DEFAULT 'ASPIRANTE',
    `apellidoPaterno` VARCHAR(191) NOT NULL,
    `apellidoMaterno` VARCHAR(191) NULL,
    `nombres` VARCHAR(191) NOT NULL,
    `curp` VARCHAR(191) NOT NULL,
    `correoElectronico1` VARCHAR(191) NOT NULL,
    `correoElectronico2` VARCHAR(191) NULL,
    `telefonoCelular` VARCHAR(191) NOT NULL,
    `telefonoParticular` VARCHAR(191) NULL,
    `generoId` INTEGER NULL,
    `identidadCulturalId` INTEGER NULL,
    `discapacidadId` INTEGER NULL,
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
    `parentescoTutorId` INTEGER NULL,
    `tutorTelefono` VARCHAR(191) NULL,
    `tipoAdmision` VARCHAR(191) NOT NULL,
    `tipoSecundariaId` INTEGER NULL,
    `subsistemaId` INTEGER NULL,
    `cctEscuelaProcedencia` VARCHAR(191) NULL,
    `nombreEscuelaProcedencia` VARCHAR(191) NULL,
    `estadoEscuelaProcedencia` VARCHAR(191) NULL,
    `promedioSecundaria` VARCHAR(191) NULL,
    `sistemaBachilleratoPrevio` VARCHAR(191) NULL,
    `otroSistemaProcedencia` VARCHAR(191) NULL,
    `cctBachilleratoPrevio` VARCHAR(191) NULL,
    `nombreBachilleratoPrevio` VARCHAR(191) NULL,
    `estadoBachilleratoPrevio` VARCHAR(191) NULL,
    `tipoEstudianteId` INTEGER NULL,
    `semestreId` INTEGER NULL,
    `planEstudios` VARCHAR(191) NULL,
    `situacionLaboralId` INTEGER NULL,
    `cuentaComputadora` VARCHAR(191) NULL,
    `cuentaInternet` VARCHAR(191) NULL,
    `medioEnteradoId` INTEGER NULL,
    `estatusAcademico` VARCHAR(191) NOT NULL DEFAULT 'ACTIVO_REGULAR',
    `emergenciaContacto` VARCHAR(191) NULL,
    `emergenciaTelefono` VARCHAR(191) NULL,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `aspirante_folio_key`(`folio`),
    UNIQUE INDEX `aspirante_matricula_key`(`matricula`),
    UNIQUE INDEX `aspirante_curp_key`(`curp`),
    UNIQUE INDEX `aspirante_correoElectronico1_key`(`correoElectronico1`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `control_escolar` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `aspiranteId` INTEGER NOT NULL,
    `dictamenGeneral` VARCHAR(191) NOT NULL DEFAULT 'PENDIENTE',
    `observaciones` TEXT NULL,
    `validadoPor` VARCHAR(191) NULL,
    `fechaValidacion` DATETIME(3) NULL,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `control_escolar_aspiranteId_key`(`aspiranteId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `documento` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `aspiranteId` INTEGER NOT NULL,
    `tipoDoc` VARCHAR(191) NOT NULL,
    `nombreArchivo` VARCHAR(191) NOT NULL,
    `archivoBlob` LONGBLOB NOT NULL,
    `estatusDoc` VARCHAR(191) NOT NULL DEFAULT 'EN REVISIÓN',
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `auditoria` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `eventoId` VARCHAR(191) NOT NULL,
    `usuarioAdminId` INTEGER NULL,
    `usuarioTexto` VARCHAR(191) NULL,
    `rol` VARCHAR(191) NULL,
    `modulo` VARCHAR(191) NOT NULL,
    `accion` VARCHAR(191) NOT NULL,
    `detalle` TEXT NOT NULL,
    `ip` VARCHAR(191) NULL,
    `nivel` VARCHAR(191) NOT NULL DEFAULT 'Informativo',
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `auditoria_eventoId_key`(`eventoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pago` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `aspiranteId` INTEGER NOT NULL,
    `concepto` VARCHAR(191) NOT NULL,
    `monto` DOUBLE NOT NULL,
    `referenciaBancaria` VARCHAR(191) NOT NULL,
    `fechaPago` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `metodo` VARCHAR(191) NOT NULL DEFAULT 'Captura Manual (Ventanilla)',
    `estatus` VARCHAR(191) NOT NULL DEFAULT 'CONCILIADO',
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `pago_referenciaBancaria_key`(`referenciaBancaria`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `plan_estudio` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clave` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `acuerdoSep` VARCHAR(191) NOT NULL,
    `totalCreditos` INTEGER NOT NULL,
    `descripcion` TEXT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `plan_estudio_clave_key`(`clave`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `materia` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `planEstudioId` INTEGER NOT NULL,
    `codigo` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `semestre` INTEGER NOT NULL,
    `modulo` INTEGER NOT NULL DEFAULT 1,
    `creditos` INTEGER NOT NULL DEFAULT 6,

    UNIQUE INDEX `materia_planEstudioId_codigo_key`(`planEstudioId`, `codigo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `seriacion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `materiaId` INTEGER NOT NULL,
    `prerrequisitoMateriaId` INTEGER NOT NULL,

    UNIQUE INDEX `seriacion_materiaId_prerrequisitoMateriaId_key`(`materiaId`, `prerrequisitoMateriaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `historial_academico` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `aspiranteId` INTEGER NOT NULL,
    `materiaId` INTEGER NOT NULL,
    `calificacion` DOUBLE NULL,
    `tipoExamen` VARCHAR(191) NULL DEFAULT 'F',
    `estatus` VARCHAR(191) NOT NULL DEFAULT 'CURSANDO',
    `periodo` VARCHAR(191) NULL,

    UNIQUE INDEX `historial_academico_aspiranteId_materiaId_key`(`aspiranteId`, `materiaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `materia_inscrita` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `aspiranteId` INTEGER NOT NULL,
    `materiaId` INTEGER NOT NULL,
    `estatus` VARCHAR(191) NOT NULL DEFAULT 'Cursando',
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `materia_inscrita_aspiranteId_materiaId_key`(`aspiranteId`, `materiaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `aspirante` ADD CONSTRAINT `aspirante_generoId_fkey` FOREIGN KEY (`generoId`) REFERENCES `genero`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `aspirante` ADD CONSTRAINT `aspirante_identidadCulturalId_fkey` FOREIGN KEY (`identidadCulturalId`) REFERENCES `identidad_cultural`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `aspirante` ADD CONSTRAINT `aspirante_discapacidadId_fkey` FOREIGN KEY (`discapacidadId`) REFERENCES `discapacidad`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `aspirante` ADD CONSTRAINT `aspirante_parentescoTutorId_fkey` FOREIGN KEY (`parentescoTutorId`) REFERENCES `parentesco`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `aspirante` ADD CONSTRAINT `aspirante_tipoSecundariaId_fkey` FOREIGN KEY (`tipoSecundariaId`) REFERENCES `tipo_secundaria`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `aspirante` ADD CONSTRAINT `aspirante_subsistemaId_fkey` FOREIGN KEY (`subsistemaId`) REFERENCES `subsistema`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `aspirante` ADD CONSTRAINT `aspirante_tipoEstudianteId_fkey` FOREIGN KEY (`tipoEstudianteId`) REFERENCES `tipo_estudiante`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `aspirante` ADD CONSTRAINT `aspirante_semestreId_fkey` FOREIGN KEY (`semestreId`) REFERENCES `semestre`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `aspirante` ADD CONSTRAINT `aspirante_situacionLaboralId_fkey` FOREIGN KEY (`situacionLaboralId`) REFERENCES `situacion_laboral`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `aspirante` ADD CONSTRAINT `aspirante_medioEnteradoId_fkey` FOREIGN KEY (`medioEnteradoId`) REFERENCES `medio_enterado`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `control_escolar` ADD CONSTRAINT `control_escolar_aspiranteId_fkey` FOREIGN KEY (`aspiranteId`) REFERENCES `aspirante`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `documento` ADD CONSTRAINT `documento_aspiranteId_fkey` FOREIGN KEY (`aspiranteId`) REFERENCES `aspirante`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `auditoria` ADD CONSTRAINT `auditoria_usuarioAdminId_fkey` FOREIGN KEY (`usuarioAdminId`) REFERENCES `usuario_admin`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pago` ADD CONSTRAINT `pago_aspiranteId_fkey` FOREIGN KEY (`aspiranteId`) REFERENCES `aspirante`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `materia` ADD CONSTRAINT `materia_planEstudioId_fkey` FOREIGN KEY (`planEstudioId`) REFERENCES `plan_estudio`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `seriacion` ADD CONSTRAINT `seriacion_materiaId_fkey` FOREIGN KEY (`materiaId`) REFERENCES `materia`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `seriacion` ADD CONSTRAINT `seriacion_prerrequisitoMateriaId_fkey` FOREIGN KEY (`prerrequisitoMateriaId`) REFERENCES `materia`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historial_academico` ADD CONSTRAINT `historial_academico_aspiranteId_fkey` FOREIGN KEY (`aspiranteId`) REFERENCES `aspirante`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historial_academico` ADD CONSTRAINT `historial_academico_materiaId_fkey` FOREIGN KEY (`materiaId`) REFERENCES `materia`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `materia_inscrita` ADD CONSTRAINT `materia_inscrita_aspiranteId_fkey` FOREIGN KEY (`aspiranteId`) REFERENCES `aspirante`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `materia_inscrita` ADD CONSTRAINT `materia_inscrita_materiaId_fkey` FOREIGN KEY (`materiaId`) REFERENCES `materia`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
