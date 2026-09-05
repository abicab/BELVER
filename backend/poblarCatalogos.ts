// backend/src/config/prisma.js o la ruta correspondiente a tu cliente de Prisma
import prisma from "./src/config/prisma.js";

async function poblar() {
  console.log("Iniciando inserción de catálogos...");

  // 1. Tipos de Secundaria
  const tiposSecundaria = [
    "SECUNDARIA GENERAL",
    "SECUNDARIA TÉCNICA",
    "TELESECUNDARIA",
    "SECUNDARIA PARA TRABAJADORES",
    "SECUNDARIA PARTICULAR / PRIVADA",
    "OTRA INSTITUCIÓN",
  ];
  for (const nombre of tiposSecundaria) {
    await prisma.tipoSecundariaCatalog.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
  }

  // 2. Subsistemas de Bachillerato / Prepa
  const subsistemas = [
    "A. SECUNDARIA",
    "C. DGB",
    "D. DGBTEBAEV",
    "E. TEBACOM",
    "F. OTRO",
  ];
  for (const nombre of subsistemas) {
    await prisma.subsistemaBachilleratoCatalog.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
  }

  // 3. Medios por los que se enteró
  const medios = [
    "FOLLETO INFORMATIVO",
    "FERIA O EXPOSICIÓN",
    "NAVEGACIÓN POR INTERNET",
    "PÁGINAS WEB DE GOBIERNO",
    "PERIÓDICO",
    "RADIO",
    "RECOMENDACIÓN DE UN AMIGO O FAMILIAR",
    "RECOMENDACIÓN DE UN ESTUDIANTE",
    "REDES SOCIALES",
    "SECRETARÍA DE EDUCACIÓN (SEV)",
    "TELEVISIÓN",
    "CORREO ELECTRÓNICO",
    "OTRO",
  ];
  for (const nombre of medios) {
    await prisma.medioEnteradoCatalog.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
  }

  // 4. Género / Identidad
  const generos = [
    "FEMENINO",
    "MASCULINO",
    "LGTBIQ+",
    "OTRO / PREFIERO NO DECIRLO",
  ];
  for (const nombre of generos) {
    await prisma.generoIdentidadCatalog.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
  }

  // 5. Identidad Cultural
  const culturales = ["AFRODESCENDIENTE", "POBLACIÓN INDÍGENA", "NINGUNO"];
  for (const nombre of culturales) {
    await prisma.identidadCulturalCatalog.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
  }

  // 6. Situación Laboral
  const laborales = [
    "NO TRABAJA / ESTUDIANTE",
    "TRABAJA MEDIO TIEMPO",
    "TRABAJA TIEMPO COMPLETO",
  ];
  for (const nombre of laborales) {
    await prisma.situacionLaboralCatalog.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
  }

  // 7. Discapacidades o Capacidades Especiales (¡Ahora dentro de la función!)
  const discapacidades = [
    "AUTISMO",
    "DISCAPACIDAD MOTRIZ",
    "DISCAPACIDAD VISUAL",
    "DISCAPACIDAD AUDITIVA",
    "DISCAPACIDAD INTELECTUAL",
  ];
  for (const nombre of discapacidades) {
    await prisma.discapacidadCatalog.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
  }

  console.log("¡Todos los catálogos han sido poblados exitosamente!");
}

// Invocación final del script
poblar()
  .catch((e) => {
    console.error("Error al poblar catálogos:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
