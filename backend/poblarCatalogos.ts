import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function poblar() {
  console.log(
    "Iniciando inserción y actualización de catálogos institucionales...",
  );

  // 1. Tipos de Usuario
  const tiposUsuarios = [
    { id: 1, tipoUsuario: "Admin", activo: true },
    { id: 2, tipoUsuario: "Aspirante", activo: true },
    { id: 3, tipoUsuario: "Control escolar", activo: true },
    { id: 4, tipoUsuario: "CAE", activo: true },
    { id: 5, tipoUsuario: "Alumno", activo: true },
    { id: 6, tipoUsuario: "AlumnoUnico", activo: true },
  ];

  for (const tipo of tiposUsuarios) {
    await prisma.tipoUsuario.upsert({
      where: { id: tipo.id },
      update: {
        tipoUsuario: tipo.tipoUsuario,
        activo: tipo.activo,
      },
      create: {
        id: tipo.id,
        tipoUsuario: tipo.tipoUsuario,
        activo: tipo.activo,
      },
    });
  }

  // 2. Subsistemas de Bachillerato / Prepa (Mapeo por letras institucionales)
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

  // 3. Género / Identidad
  const generos = ["FEMENINO", "MASCULINO", "LGBTQ+", "PREFIERO NO DECIRLO"];
  for (const nombre of generos) {
    await prisma.genero.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
  }

  // 4. Identidad Cultural
  const culturales = ["AFRODESCENDIENTE", "POBLACIÓN INDÍGENA", "NINGUNO"];
  for (const nombre of culturales) {
    await prisma.identidadCultural.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
  }

  // 5. Discapacidades (Catálogo completo para selección múltiple)
  const discapacidades = [
    "DISCAPACIDAD MOTRIZ",
    "DISCAPACIDAD VISUAL",
    "DISCAPACIDAD AUDITIVA",
    "DISCAPACIDAD INTELECTUAL",
    "DISCAPACIDAD DEL ESPECTRO AUTISTA",
    "TRASTORNO POR DÉFICIT DE ATENCIÓN E HIPERACTIVIDAD",
    "DIFICULTAD SEVERA DE APRENDIZAJE",
    "DIFICULTAD SEVERA DE CONDUCTA",
    "DIFICULTAD SEVERA DE COMUNICACIÓN",
    "NINGUNA",
  ];
  for (const nombre of discapacidades) {
    await prisma.discapacidad.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
  }

  // 6. Parentesco del Tutor
  const parentescos = ["MAMÁ", "PAPÁ", "SOY YO", "OTRO"];
  for (const nombre of parentescos) {
    await prisma.parentesco.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
  }

  // 7. Tipo de Estudiante
  const tiposEstudiante = ["REGULAR", "REPETIDOR"];
  for (const nombre of tiposEstudiante) {
    await prisma.tipoEstudiante.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
  }

  // 8. Semestres
  const semestres = [
    "1° Semestre",
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

  // 9. Plan de Estudios Principal
  const plan = await prisma.planEstudio.upsert({
    where: { clave: "BG-BELVER-2026" },
    update: {},
    create: {
      clave: "BG-BELVER-2026",
      nombre: "Bachillerato General Mixto Especializado",
      descripcion:
        "Modelo educativo flexible de Bachillerato en Línea de Veracruz con evaluación continua y carga modular.",
      activo: true,
    },
  });

  // 10. Catálogo de Materias Integradas
  const materiasData = [
    // Primer Semestre
    {
      codigo: "MAT101",
      nombreCompleto: "Matemáticas I",
      nombreCorto: "Matemáticas I",
      semestre: 1,
    },
    {
      codigo: "QUI101",
      nombreCompleto: "Química I",
      nombreCorto: "Química I",
      semestre: 1,
    },
    {
      codigo: "LEO101",
      nombreCompleto: "Taller de Lectura y Redacción I",
      nombreCorto: "T. Lectura y Redacción I",
      semestre: 1,
    },
    {
      codigo: "ING101",
      nombreCompleto: "Inglés I",
      nombreCorto: "Inglés I",
      semestre: 1,
    },
    {
      codigo: "INP101",
      nombreCompleto: "Informática I",
      nombreCorto: "Informática I",
      semestre: 1,
    },
    {
      codigo: "ETI101",
      nombreCompleto: "Ética y Valores I",
      nombreCorto: "Ética y Valores I",
      semestre: 1,
    },

    // Segundo Semestre
    {
      codigo: "MAT102",
      nombreCompleto: "Matemáticas II",
      nombreCorto: "Matemáticas II",
      semestre: 2,
    },
    {
      codigo: "QUI102",
      nombreCompleto: "Química II",
      nombreCorto: "Química II",
      semestre: 2,
    },
    {
      codigo: "LEO102",
      nombreCompleto: "Taller de Lectura y Redacción II",
      nombreCorto: "T. Lectura y Redacción II",
      semestre: 2,
    },
    {
      codigo: "ING102",
      nombreCompleto: "Inglés II",
      nombreCorto: "Inglés II",
      semestre: 2,
    },
    {
      codigo: "INP102",
      nombreCompleto: "Informática II",
      nombreCorto: "Informática II",
      semestre: 2,
    },
    {
      codigo: "ETI102",
      nombreCompleto: "Ética y Valores II",
      nombreCorto: "Ética y Valores II",
      semestre: 2,
    },

    // Tercer Semestre
    {
      codigo: "MAT103",
      nombreCompleto: "Matemáticas III",
      nombreCorto: "Matemáticas III",
      semestre: 3,
    },
    {
      codigo: "FIS101",
      nombreCompleto: "Física I",
      nombreCorto: "Física I",
      semestre: 3,
    },
    {
      codigo: "BIO101",
      nombreCompleto: "Biología I",
      nombreCorto: "Biología I",
      semestre: 3,
    },
    {
      codigo: "HIS101",
      nombreCompleto: "Historia de México I",
      nombreCorto: "Hist. de México I",
      semestre: 3,
    },
    {
      codigo: "LIT101",
      nombreCompleto: "Literatura I",
      nombreCorto: "Literatura I",
      semestre: 3,
    },
    {
      codigo: "ING103",
      nombreCompleto: "Inglés III",
      nombreCorto: "Inglés III",
      semestre: 3,
    },

    // Cuarto Semestre
    {
      codigo: "MAT104",
      nombreCompleto: "Matemáticas IV",
      nombreCorto: "Matemáticas IV",
      semestre: 4,
    },
    {
      codigo: "FIS102",
      nombreCompleto: "Física II",
      nombreCorto: "Física II",
      semestre: 4,
    },
    {
      codigo: "BIO102",
      nombreCompleto: "Biología II",
      nombreCorto: "Biología II",
      semestre: 4,
    },
    {
      codigo: "SOC101",
      nombreCompleto: "Introducción a las Ciencias Sociales",
      nombreCorto: "Intro. C. Sociales",
      semestre: 4,
    },
    {
      codigo: "HIS102",
      nombreCompleto: "Historia de México II",
      nombreCorto: "Hist. de México II",
      semestre: 4,
    },
    {
      codigo: "LIT102",
      nombreCompleto: "Literatura II",
      nombreCorto: "Literatura II",
      semestre: 4,
    },
    {
      codigo: "ING104",
      nombreCompleto: "Inglés IV",
      nombreCorto: "Inglés IV",
      semestre: 4,
    },
    {
      codigo: "ECO101",
      nombreCompleto: "Estructura Socioeconómica de México",
      nombreCorto: "Estruc. Socioeconómica",
      semestre: 4,
    },

    // Quinto Semestre
    {
      codigo: "GEO101",
      nombreCompleto: "Geografía",
      nombreCorto: "Geografía",
      semestre: 5,
    },
    {
      codigo: "CMS101",
      nombreCompleto: "Estructura Social y Política",
      nombreCorto: "Estruc. Social y Política",
      semestre: 5,
    },
    {
      codigo: "EMP101",
      nombreCompleto: "Capacitación para el Trabajo I",
      nombreCorto: "Cap. Trabajo I",
      semestre: 5,
    },
    {
      codigo: "EMP102",
      nombreCompleto: "Capacitación para el Trabajo II",
      nombreCorto: "Cap. Trabajo II",
      semestre: 5,
    },
    {
      codigo: "PRO101",
      nombreCompleto: "Probabilidad y Estadística I",
      nombreCorto: "Prob. y Estadística I",
      semestre: 5,
    },
    {
      codigo: "MET101",
      nombreCompleto: "Metodología de la Investigación",
      nombreCorto: "Metodología Inv.",
      semestre: 5,
    },
    {
      codigo: "FIL101",
      nombreCompleto: "Filosofía I",
      nombreCorto: "Filosofía I",
      semestre: 5,
    },
    {
      codigo: "EMP103",
      nombreCompleto: "Capacitación para el Trabajo III",
      nombreCorto: "Cap. Trabajo III",
      semestre: 5,
    },

    // Sexto Semestre
    {
      codigo: "ECOL101",
      nombreCompleto: "Ecología y Medio Ambiente",
      nombreCorto: "Ecología y M.A.",
      semestre: 6,
    },
    {
      codigo: "HIS201",
      nombreCompleto: "Historia Universal Contemporánea",
      nombreCorto: "Hist. Univ. Cont.",
      semestre: 6,
    },
    {
      codigo: "EMP104",
      nombreCompleto: "Capacitación para el Trabajo IV",
      nombreCorto: "Cap. Trabajo IV",
      semestre: 6,
    },
    {
      codigo: "EMP105",
      nombreCompleto: "Capacitación para el Trabajo V",
      nombreCorto: "Cap. Trabajo V",
      semestre: 6,
    },
    {
      codigo: "PRO102",
      nombreCompleto: "Probabilidad y Estadística II",
      nombreCorto: "Prob. y Estadística II",
      semestre: 6,
    },
    {
      codigo: "FIL102",
      nombreCompleto: "Filosofía II",
      nombreCorto: "Filosofía II",
      semestre: 6,
    },
    {
      codigo: "EMP106",
      nombreCompleto: "Capacitación para el Trabajo VI",
      nombreCorto: "Cap. Trabajo VI",
      semestre: 6,
    },
    {
      codigo: "PROJ101",
      nombreCompleto: "Proyecto Integrador Final",
      nombreCorto: "Proyecto Final",
      semestre: 6,
    },
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
        nombreCompleto: m.nombreCompleto,
        nombreCorto: m.nombreCorto,
        semestre: m.semestre,
      },
      create: {
        codigo: m.codigo,
        nombreCompleto: m.nombreCompleto,
        nombreCorto: m.nombreCorto,
        semestre: m.semestre,
        planEstudioId: plan.id,
      },
    });
  }

  console.log(
    "¡Los catálogos institucionales, tipos de usuario, plan de estudios y materias se han poblado exitosamente!",
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
