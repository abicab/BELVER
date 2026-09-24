-- CreateTable
CREATE TABLE `catalogo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombreTabla` VARCHAR(50) NOT NULL,
    `tituloVisible` VARCHAR(50) NOT NULL,
    `orden` INTEGER NOT NULL DEFAULT 0,
    `activo` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `catalogo_nombreTabla_key`(`nombreTabla`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subsistema` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(50) NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `subsistema_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `genero` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(50) NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `genero_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `identidad_cultural` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(50) NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `identidad_cultural_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `discapacidad` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(50) NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `discapacidad_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `aspirante_discapacidad` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `aspiranteId` INTEGER NOT NULL,
    `discapacidadId` INTEGER NOT NULL,

    UNIQUE INDEX `aspirante_discapacidad_aspiranteId_discapacidadId_key`(`aspiranteId`, `discapacidadId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `parentesco` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(50) NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `parentesco_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tipo_estudiante` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(50) NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `tipo_estudiante_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `semestre` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(50) NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `semestre_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tipo_usuario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tipo_usuario` VARCHAR(50) NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuarios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_tipoUsuario` INTEGER NOT NULL,
    `correo` VARCHAR(50) NOT NULL,
    `contrasena` VARCHAR(255) NOT NULL,
    `nombres` VARCHAR(50) NOT NULL,
    `apellidoPaterno` VARCHAR(50) NOT NULL,
    `apellidoMaterno` VARCHAR(50) NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `usuarios_correo_key`(`correo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `aspirante` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `folio` VARCHAR(50) NOT NULL,
    `vigenciaFolio` DATETIME(3) NULL,
    `matricula` VARCHAR(50) NULL,
    `password` VARCHAR(255) NULL,
    `tipo_usuario_id` INTEGER NOT NULL DEFAULT 2,
    `apellidoPaterno` VARCHAR(50) NOT NULL,
    `apellidoMaterno` VARCHAR(50) NULL,
    `nombres` VARCHAR(50) NOT NULL,
    `curp` VARCHAR(50) NOT NULL,
    `fechaNacimiento` DATETIME(3) NULL,
    `correoElectronico1` VARCHAR(50) NOT NULL,
    `correoElectronico2` VARCHAR(50) NULL,
    `telefonoCelular` VARCHAR(50) NOT NULL,
    `telefonoParticular` VARCHAR(50) NULL,
    `generoId` INTEGER NULL,
    `identidadCulturalId` INTEGER NULL,
    `pais` VARCHAR(50) NOT NULL DEFAULT 'MÉXICO',
    `codigoPostal` VARCHAR(50) NULL,
    `estado` VARCHAR(50) NOT NULL,
    `municipio` VARCHAR(50) NOT NULL,
    `colonia` VARCHAR(50) NOT NULL,
    `calle` VARCHAR(50) NOT NULL,
    `numeroExterior` VARCHAR(50) NULL,
    `numeroInterior` VARCHAR(50) NULL,
    `tutorApellidoPaterno` VARCHAR(50) NULL,
    `tutorApellidoMaterno` VARCHAR(50) NULL,
    `tutorNombres` VARCHAR(50) NULL,
    `parentescoTutorId` INTEGER NULL,
    `tutorTelefono` VARCHAR(50) NULL,
    `tipoAdmision` VARCHAR(50) NOT NULL,
    `subsistemaId` INTEGER NULL,
    `cctEscuelaProcedencia` VARCHAR(50) NULL,
    `nombreEscuelaProcedencia` VARCHAR(50) NULL,
    `sistemaProcedenciaLetra` VARCHAR(50) NULL,
    `otroSistemaProcedencia` VARCHAR(50) NULL,
    `tipoEstudianteId` INTEGER NULL,
    `semestreId` INTEGER NULL,
    `planEstudios` VARCHAR(50) NULL,
    `estatusAcademico` VARCHAR(50) NOT NULL DEFAULT 'ACTIVO_REGULAR',
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `aspirante_folio_key`(`folio`),
    UNIQUE INDEX `aspirante_matricula_key`(`matricula`),
    UNIQUE INDEX `aspirante_curp_key`(`curp`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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

-- CreateTable
CREATE TABLE `documento` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `aspiranteId` INTEGER NOT NULL,
    `tipoDoc` VARCHAR(50) NOT NULL,
    `nombreArchivo` VARCHAR(50) NOT NULL,
    `archivoBlob` LONGBLOB NOT NULL,
    `estatusDoc` VARCHAR(50) NOT NULL DEFAULT 'EN REVISIÓN',
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `auditoria` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `eventoId` VARCHAR(50) NOT NULL,
    `UsuariosId` INTEGER NULL,
    `usuarioTexto` VARCHAR(50) NULL,
    `rol` VARCHAR(50) NULL,
    `modulo` VARCHAR(50) NOT NULL,
    `accion` VARCHAR(50) NOT NULL,
    `detalle` TEXT NOT NULL,
    `ip` VARCHAR(50) NULL,
    `level` VARCHAR(50) NOT NULL DEFAULT 'Informativo',
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `auditoria_eventoId_key`(`eventoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pago` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `aspiranteId` INTEGER NOT NULL,
    `concepto` VARCHAR(50) NOT NULL,
    `monto` DOUBLE NOT NULL,
    `referenciaBancaria` VARCHAR(50) NOT NULL,
    `fechaPago` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `metodo` VARCHAR(50) NOT NULL DEFAULT 'Captura Manual (Ventanilla)',
    `estatus` VARCHAR(50) NOT NULL DEFAULT 'CONCILIADO',
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `pago_referenciaBancaria_key`(`referenciaBancaria`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `plan_estudio` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clave` VARCHAR(50) NOT NULL,
    `nombre` VARCHAR(50) NOT NULL,
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
    `codigo` VARCHAR(50) NOT NULL,
    `nombre_completo` VARCHAR(50) NOT NULL,
    `nombre_corto` VARCHAR(50) NOT NULL,
    `semestre` INTEGER NOT NULL,

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
    `tipoExamen` VARCHAR(50) NULL DEFAULT 'F',
    `estatus` VARCHAR(50) NOT NULL DEFAULT 'CURSANDO',
    `periodo` VARCHAR(50) NULL,

    UNIQUE INDEX `historial_academico_aspiranteId_materiaId_key`(`aspiranteId`, `materiaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `materia_inscrita` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `aspiranteId` INTEGER NOT NULL,
    `materiaId` INTEGER NOT NULL,
    `estatus` VARCHAR(50) NOT NULL DEFAULT 'Cursando',
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `materia_inscrita_aspiranteId_materiaId_key`(`aspiranteId`, `materiaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `aspirante_discapacidad` ADD CONSTRAINT `aspirante_discapacidad_aspiranteId_fkey` FOREIGN KEY (`aspiranteId`) REFERENCES `aspirante`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `aspirante_discapacidad` ADD CONSTRAINT `aspirante_discapacidad_discapacidadId_fkey` FOREIGN KEY (`discapacidadId`) REFERENCES `discapacidad`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usuarios` ADD CONSTRAINT `usuarios_id_tipoUsuario_fkey` FOREIGN KEY (`id_tipoUsuario`) REFERENCES `tipo_usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `aspirante` ADD CONSTRAINT `aspirante_tipo_usuario_id_fkey` FOREIGN KEY (`tipo_usuario_id`) REFERENCES `tipo_usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `aspirante` ADD CONSTRAINT `aspirante_generoId_fkey` FOREIGN KEY (`generoId`) REFERENCES `genero`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `aspirante` ADD CONSTRAINT `aspirante_identidadCulturalId_fkey` FOREIGN KEY (`identidadCulturalId`) REFERENCES `identidad_cultural`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `aspirante` ADD CONSTRAINT `aspirante_parentescoTutorId_fkey` FOREIGN KEY (`parentescoTutorId`) REFERENCES `parentesco`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `aspirante` ADD CONSTRAINT `aspirante_subsistemaId_fkey` FOREIGN KEY (`subsistemaId`) REFERENCES `subsistema`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `aspirante` ADD CONSTRAINT `aspirante_tipoEstudianteId_fkey` FOREIGN KEY (`tipoEstudianteId`) REFERENCES `tipo_estudiante`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `aspirante` ADD CONSTRAINT `aspirante_semestreId_fkey` FOREIGN KEY (`semestreId`) REFERENCES `semestre`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `validacion_expedientes` ADD CONSTRAINT `validacion_expedientes_aspiranteId_fkey` FOREIGN KEY (`aspiranteId`) REFERENCES `aspirante`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `documento` ADD CONSTRAINT `documento_aspiranteId_fkey` FOREIGN KEY (`aspiranteId`) REFERENCES `aspirante`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `auditoria` ADD CONSTRAINT `auditoria_UsuariosId_fkey` FOREIGN KEY (`UsuariosId`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

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
