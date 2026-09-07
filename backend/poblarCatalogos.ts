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

  // 12. Plan de Estudios Principal
  const plan = await prisma.planEstudio.upsert({
    where: { clave: "BG-BELVER-2026" },
    update: {},
    create: {
      clave: "BG-BELVER-2026",
      nombre: "Bachillerato General Mixto Especializado",
      acuerdoSep: "Acuerdo SEV-2026",
      totalCreditos: 180,
      descripcion:
        "Modelo educativo flexible de Bachillerato en Línea de Veracruz con evaluación continua y carga modular.",
      activo: true,
    },
  });

  // 13. Catálogo de Materias Integradas
  const materiasData = [
    // Primer Semestre
    { codigo: "MAT101", nombre: "Matemáticas I", semestre: 1, modulo: 1, creditos: 6 },
    { codigo: "QUI101", nombre: "Química I", semestre: 1, modulo: 1, creditos: 6 },
    { codigo: "LEO101", nombre: "Taller de Lectura y Redacción I", semestre: 1, modulo: 1, creditos: 6 },
    { codigo: "ING101", nombre: "Inglés I", semestre: 1, modulo: 2, creditos: 6 },
    { codigo: "INP101", nombre: "Informática I", semestre: 1, modulo: 2, creditos: 6 },
    { codigo: "ETI101", nombre: "Ética y Valores I", semestre: 1, modulo: 2, creditos: 6 },

    // Segundo Semestre
    { codigo: "MAT102", nombre: "Matemáticas II", semestre: 2, modulo: 1, creditos: 6 },
    { codigo: "QUI102", nombre: "Química II", semestre: 2, modulo: 1, creditos: 6 },
    { codigo: "LEO102", nombre: "Taller de Lectura y Redacción II", semestre: 2, modulo: 1, creditos: 6 },
    { codigo: "ING102", nombre: "Inglés II", semestre: 2, modulo: 2, creditos: 6 },
    { codigo: "INP102", nombre: "Informática II", semestre: 2, modulo: 2, creditos: 6 },
    { codigo: "ETI102", nombre: "Ética y Valores II", semestre: 2, modulo: 2, creditos: 6 },

    // Tercer Semestre
    { codigo: "MAT103", nombre: "Matemáticas III", semestre: 3, modulo: 1, creditos: 6 },
    { codigo: "FIS101", nombre: "Física I", semestre: 3, modulo: 1, creditos: 6 },
    { codigo: "BIO101", nombre: "Biología I", semestre: 3, modulo: 1, creditos: 6 },
    { codigo: "HIS101", nombre: "Historia de México I", semestre: 3, modulo: 2, creditos: 6 },
    { codigo: "LIT101", nombre: "Literatura I", semestre: 3, modulo: 2, creditos: 6 },
    { codigo: "ING103", nombre: "Inglés III", semestre: 3, modulo: 2, creditos: 6 },

    // Cuarto Semestre
    { codigo: "MAT104", nombre: "Matemáticas IV", semestre: 4, modulo: 1, creditos: 6 },
    { codigo: "FIS102", nombre: "Física II", semestre: 4, modulo: 1, creditos: 6 },
    { codigo: "BIO102", nombre: "Biología II", semestre: 4, modulo: 1, creditos: 6 },
    { codigo: "SOC101", nombre: "Introducción a las Ciencias Sociales", semestre: 4, modulo: 1, creditos: 6 },
    { codigo: "HIS102", nombre: "Historia de México II", semestre: 4, modulo: 2, creditos: 6 },
    { codigo: "LIT102", nombre: "Literatura II", semestre: 4, modulo: 2, creditos: 6 },
    { codigo: "ING104", nombre: "Inglés IV", semestre: 4, modulo: 2, creditos: 6 },
    { codigo: "ECO101", nombre: "Estructura Socioeconómica de México", semestre: 4, modulo: 2, creditos: 6 },

    // Quinto Semestre
    { codigo: "GEO101", nombre: "Geografía", semestre: 5, modulo: 1, creditos: 6 },
    { codigo: "CMS101", nombre: "Estructura Social y Política", semestre: 5, modulo: 1, creditos: 6 },
    { codigo: "EMP101", nombre: "Capacitación para el Trabajo I", semestre: 5, modulo: 1, creditos: 6 },
    { codigo: "EMP102", nombre: "Capacitación para el Trabajo II", semestre: 5, modulo: 1, creditos: 6 },
    { codigo: "PRO101", nombre: "Probabilidad y Estadística I", semestre: 5, modulo: 2, creditos: 6 },
    { codigo: "MET101", nombre: "Metodología de la Investigación", semestre: 5, modulo: 2, creditos: 6 },
    { codigo: "FIL101", nombre: "Filosofía I", semestre: 5, modulo: 2, creditos: 6 },
    { codigo: "EMP103", nombre: "Capacitación para el Trabajo III", semestre: 5, modulo: 2, creditos: 6 },

    // Sexto Semestre
    { codigo: "ECOL101", nombre: "Ecología y Medio Ambiente", semestre: 6, modulo: 1, creditos: 6 },
    { codigo: "HIS201", nombre: "Historia Universal Contemporánea", semestre: 6, modulo: 1, creditos: 6 },
    { codigo: "EMP104", nombre: "Capacitación para el Trabajo IV", semestre: 6, modulo: 1, creditos: 6 },
    { codigo: "EMP105", nombre: "Capacitación para el Trabajo V", semestre: 6, modulo: 1, creditos: 6 },
    { codigo: "PRO102", nombre: "Probabilidad y Estadística II", semestre: 6, modulo: 2, creditos: 6 },
    { codigo: "FIL102", nombre: "Filosofía II", semestre: 6, modulo: 2, creditos: 6 },
    { codigo: "EMP106", nombre: "Capacitación para el Trabajo VI", semestre: 6, modulo: 2, creditos: 6 },
    { codigo: "PROJ101", nombre: "Proyecto Integrador Final", semestre: 6, modulo: 2, creditos: 6 },
  ];

  for (const m of materiasData) {
    await prisma.materia.upsert({
      where: {
        planEstudioId_codigo: {
          planEstudioId: plan.id,
          codigo: m.codigo,
        },
      },
      update: {
        nombre: m.nombre,
        semestre: m.semestre,
        modulo: m.modulo,
        creditos: m.creditos,
      },
      create: {
        ...m,
        planEstudioId: plan.id,
      },
    });
  }

  console.log(
    "¡Todos los catálogos normalizados, el plan de estudios y las materias han sido poblados exitosamente!",
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