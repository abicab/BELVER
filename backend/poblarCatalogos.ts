import prisma from "./src/config/prisma.js";

async function poblar() {
  console.log("Iniciando inserción de catálogos normalizados...");

  // 1. Directorio Maestro de Catálogos (Para el panel de administración)
  const metadataCatalogos = [
    {
      nombreTabla: "tipoSecundaria",
      tituloVisible: "Tipos de Secundaria",
      orden: 1,
    },
    {
      nombreTabla: "subsistema",
      tituloVisible: "Subsistemas de Bachillerato",
      orden: 2,
    },
    {
      nombreTabla: "medioEnterado",
      tituloVisible: "Medios por los que se enteró",
      orden: 3,
    },
    { nombreTabla: "genero", tituloVisible: "Género e Identidad", orden: 4 },
    {
      nombreTabla: "identidadCultural",
      tituloVisible: "Identidad Cultural",
      orden: 5,
    },
    {
      nombreTabla: "situacionLaboral",
      tituloVisible: "Situación Laboral",
      orden: 6,
    },
    { nombreTabla: "discapacidad", tituloVisible: "Discapacidades", orden: 7 },
    {
      nombreTabla: "parentesco",
      tituloVisible: "Parentesco del Tutor",
      orden: 8,
    },
    {
      nombreTabla: "tipoEstudiante",
      tituloVisible: "Tipos de Estudiante",
      orden: 9,
    },
    { nombreTabla: "semestre", tituloVisible: "Semestres", orden: 10 },
  ];

  for (const cat of metadataCatalogos) {
    await prisma.catalogo.upsert({
      where: { nombreTabla: cat.nombreTabla },
      update: { tituloVisible: cat.tituloVisible, orden: cat.orden },
      create: cat,
    });
  }

  // 2. Tipos de Secundaria
  const tiposSecundaria = [
    "SECUNDARIA GENERAL",
    "SECUNDARIA TÉCNICA",
    "TELESECUNDARIA",
    "SECUNDARIA PARA TRABAJADORES",
    "SECUNDARIA PARTICULAR / PRIVADA",
    "OTRA INSTITUCIÓN",
  ];
  for (const nombre of tiposSecundaria) {
    await prisma.tipoSecundaria.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
  }

  // 3. Subsistemas de Bachillerato / Prepa
  const subsistemas = [
    "A. SECUNDARIA",
    "C. DGB",
    "D. DGBTEBAEV",
    "E. TEBACOM",
    "F. OTRO",
  ];
  for (const nombre of subsistemas) {
    await prisma.subsistema.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
  }

  // 4. Medios por los que se enteró
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
    await prisma.medioEnterado.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
  }

  // 5. Género / Identidad
  const generos = [
    "FEMENINO",
    "MASCULINO",
    "LGTBIQ+",
    "OTRO / PREFIERO NO DECIRLO",
  ];
  for (const nombre of generos) {
    await prisma.genero.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
  }

  // 6. Identidad Cultural
  const culturales = ["AFRODESCENDIENTE", "POBLACIÓN INDÍGENA", "NINGUNO"];
  for (const nombre of culturales) {
    await prisma.identidadCultural.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
  }

  // 7. Situación Laboral
  const laborales = [
    "NO TRABAJA / ESTUDIANTE",
    "TRABAJA MEDIO TIEMPO",
    "TRABAJA TIEMPO COMPLETO",
  ];
  for (const nombre of laborales) {
    await prisma.situacionLaboral.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
  }

  // 8. Discapacidades
  const discapacidades = [
    "AUTISMO",
    "DISCAPACIDAD MOTRIZ",
    "DISCAPACIDAD VISUAL",
    "DISCAPACIDAD AUDITIVA",
    "DISCAPACIDAD INTELECTUAL",
  ];
  for (const nombre of discapacidades) {
    await prisma.discapacidad.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
  }

  // 9. Parentesco del Tutor
  const parentescos = ["MAMÁ", "PAPÁ", "SOY YO", "OTRO"];
  for (const nombre of parentescos) {
    await prisma.parentesco.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
  }

  // 10. Tipo de Estudiante
  const tiposEstudiante = ["REGULAR", "REPETIDOR"];
  for (const nombre of tiposEstudiante) {
    await prisma.tipoEstudiante.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
  }

  // 11. Semestres
  const semestres = [
    "2° Semestre",
    "3° Semestre",
    "4° Semestre",
    "5° Semestre",
    "6° Semestre",
  ];
  for (const nombre of semestres) {
    await prisma.semestre.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
  }

  console.log(
    "¡Todos los catálogos normalizados han sido poblados exitosamente!",
  );
}

poblar()
  .catch((e) => {
    console.error("Error al poblar catálogos:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
