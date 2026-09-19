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
    { nombreTabla: "tipoUsuario", tituloVisible: "Tipos de Usuario", orden: 11 },
  ];

  for (const cat of metadataCatalogos) {
    await prisma.catalogo.upsert({
      where: { nombreTabla: cat.nombreTabla },
      update: { tituloVisible: cat.tituloVisible, orden: cat.orden },
      create: cat,
    });
  }

  // 2. Tipos de Usuario
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
        activo: tipo.activo 
      },
      create: { 
        id: tipo.id, 
        tipoUsuario: tipo.tipoUsuario, 
        activo: tipo.activo 
      },
    });
  }

  // 3. Tipos de Secundaria
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

  // 4. Subsistemas de Bachillerato / Prepa
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

  // 5. Medios por los que se enteró
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

  // 6. Género / Identidad
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

  // 7. Identidad Cultural
  const culturales = ["AFRODESCENDIENTE", "POBLACIÓN INDÍGENA", "NINGUNO"];
  for (const nombre of culturales) {
    await prisma.identidadCultural.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
  }

  // 8. Situación Laboral
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

  // 9. Discapacidades
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

  // 10. Parentesco del Tutor
  const parentescos = ["MAMÁ", "PAPÁ", "SOY YO", "OTRO"];
  for (const nombre of parentescos) {
    await prisma.parentesco.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
  }

  // 11. Tipo de Estudiante
  const tiposEstudiante = ["REGULAR", "REPETIDOR"];
  for (const nombre of tiposEstudiante) {
    await prisma.tipoEstudiante.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
  }

  // 12. Semestres
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

  // 13. Plan de Estudios Principal
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

  // 14. Catálogo de Materias Integradas (Con código, nombreCompleto, nombreCorto y semestre)
  const materiasData = [
    // Primer Semestre
    { codigo: "MAT101", nombreCompleto: "Matemáticas I", nombreCorto: "Matemáticas I", semestre: 1 },
    { codigo: "QUI101", nombreCompleto: "Química I", nombreCorto: "Química I", semestre: 1 },
    { codigo: "LEO101", nombreCompleto: "Taller de Lectura y Redacción I", nombreCorto: "T. Lectura y Redacción I", semestre: 1 },
    { codigo: "ING101", nombreCompleto: "Inglés I", nombreCorto: "Inglés I", semestre: 1 },
    { codigo: "INP101", nombreCompleto: "Informática I", nombreCorto: "Informática I", semestre: 1 },
    { codigo: "ETI101", nombreCompleto: "Ética y Valores I", nombreCorto: "Ética y Valores I", semestre: 1 },

    // Segundo Semestre
    { codigo: "MAT102", nombreCompleto: "Matemáticas II", nombreCorto: "Matemáticas II", semestre: 2 },
    { codigo: "QUI102", nombreCompleto: "Química II", nombreCorto: "Química II", semestre: 2 },
    { codigo: "LEO102", nombreCompleto: "Taller de Lectura y Redacción II", nombreCorto: "T. Lectura y Redacción II", semestre: 2 },
    { codigo: "ING102", nombreCompleto: "Inglés II", nombreCorto: "Inglés II", semestre: 2 },
    { codigo: "INP102", nombreCompleto: "Informática II", nombreCorto: "Informática II", semestre: 2 },
    { codigo: "ETI102", nombreCompleto: "Ética y Valores II", nombreCorto: "Ética y Valores II", semestre: 2 },

    // Tercer Semestre
    { codigo: "MAT103", nombreCompleto: "Matemáticas III", nombreCorto: "Matemáticas III", semestre: 3 },
    { codigo: "FIS101", nombreCompleto: "Física I", nombreCorto: "Física I", semestre: 3 },
    { codigo: "BIO101", nombreCompleto: "Biología I", nombreCorto: "Biología I", semestre: 3 },
    { codigo: "HIS101", nombreCompleto: "Historia de México I", nombreCorto: "Hist. de México I", semestre: 3 },
    { codigo: "LIT101", nombreCompleto: "Literatura I", nombreCorto: "Literatura I", semestre: 3 },
    { codigo: "ING103", nombreCompleto: "Inglés III", nombreCorto: "Inglés III", semestre: 3 },

    // Cuarto Semestre
    { codigo: "MAT104", nombreCompleto: "Matemáticas IV", nombreCorto: "Matemáticas IV", semestre: 4 },
    { codigo: "FIS102", nombreCompleto: "Física II", nombreCorto: "Física II", semestre: 4 },
    { codigo: "BIO102", nombreCompleto: "Biología II", nombreCorto: "Biología II", semestre: 4 },
    { codigo: "SOC101", nombreCompleto: "Introducción a las Ciencias Sociales", nombreCorto: "Intro. C. Sociales", semestre: 4 },
    { codigo: "HIS102", nombreCompleto: "Historia de México II", nombreCorto: "Hist. de México II", semestre: 4 },
    { codigo: "LIT102", nombreCompleto: "Literatura II", nombreCorto: "Literatura II", semestre: 4 },
    { codigo: "ING104", nombreCompleto: "Inglés IV", nombreCorto: "Inglés IV", semestre: 4 },
    { codigo: "ECO101", nombreCompleto: "Estructura Socioeconómica de México", nombreCorto: "Estruc. Socioeconómica", semestre: 4 },

    // Quinto Semestre
    { codigo: "GEO101", nombreCompleto: "Geografía", nombreCorto: "Geografía", semestre: 5 },
    { codigo: "CMS101", nombreCompleto: "Estructura Social y Política", nombreCorto: "Estruc. Social y Política", semestre: 5 },
    { codigo: "EMP101", nombreCompleto: "Capacitación para el Trabajo I", nombreCorto: "Cap. Trabajo I", semestre: 5 },
    { codigo: "EMP102", nombreCompleto: "Capacitación para el Trabajo II", nombreCorto: "Cap. Trabajo II", semestre: 5 },
    { codigo: "PRO101", nombreCompleto: "Probabilidad y Estadística I", nombreCorto: "Prob. y Estadística I", semestre: 5 },
    { codigo: "MET101", nombreCompleto: "Metodología de la Investigación", nombreCorto: "Metodología Inv.", semestre: 5 },
    { codigo: "FIL101", nombreCompleto: "Filosofía I", nombreCorto: "Filosofía I", semestre: 5 },
    { codigo: "EMP103", nombreCompleto: "Capacitación para el Trabajo III", nombreCorto: "Cap. Trabajo III", semestre: 5 },

    // Sexto Semestre
    { codigo: "ECOL101", nombreCompleto: "Ecología y Medio Ambiente", nombreCorto: "Ecología y M.A.", semestre: 6 },
    { codigo: "HIS201", nombreCompleto: "Historia Universal Contemporánea", nombreCorto: "Hist. Univ. Cont.", semestre: 6 },
    { codigo: "EMP104", nombreCompleto: "Capacitación para el Trabajo IV", nombreCorto: "Cap. Trabajo IV", semestre: 6 },
    { codigo: "EMP105", nombreCompleto: "Capacitación para el Trabajo V", nombreCorto: "Cap. Trabajo V", semestre: 6 },
    { codigo: "PRO102", nombreCompleto: "Probabilidad y Estadística II", nombreCorto: "Prob. y Estadística II", semestre: 6 },
    { codigo: "FIL102", nombreCompleto: "Filosofía II", nombreCorto: "Filosofía II", semestre: 6 },
    { codigo: "EMP106", nombreCompleto: "Capacitación para el Trabajo VI", nombreCorto: "Cap. Trabajo VI", semestre: 6 },
    { codigo: "PROJ101", nombreCompleto: "Proyecto Integrador Final", nombreCorto: "Proyecto Final", semestre: 6 },
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
    "¡Todos los catálogos normalizados, tipos de usuario, plan de estudios y materias han sido poblados exitosamente!",
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