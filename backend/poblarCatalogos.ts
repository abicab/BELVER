import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function poblar() {
  console.log("Iniciando inserción y actualización de catálogos institucionales...");

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
      update: { tipoUsuario: tipo.tipoUsuario, activo: tipo.activo },
      create: { id: tipo.id, tipoUsuario: tipo.tipoUsuario, activo: tipo.activo },
    });
  }

  // 2. Subsistemas
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

  // 3. Género
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

  // 5. Discapacidades
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

  // 6. Parentesco
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

  // 9. Plan de Estudios BELVER 2023
  const plan = await prisma.planEstudio.upsert({
    where: { clave: "BG-BELVER-2023" },
    update: {},
    create: {
      clave: "BG-BELVER-2023",
      nombre: "Bachillerato en Línea de Veracruz Plan 2023",
      descripcion:
        "Plan de Estudios de Bachillerato en Línea de Veracruz con Mapa Curricular Marco 2023.",
      activo: true,
    },
  });

  // 10. Catálogo de Materias Oficiales (48 UACs - Plan 2023)
  const materiasData = [
    // --- PRIMER SEMESTRE ---
    { codigo: "101", nombreCompleto: "LA MATERIA Y SUS INTERACCIONES", nombreCorto: "LA MATERIA Y SUS INTERACCIONES", semestre: 1 },
    { codigo: "102", nombreCompleto: "CIENCIAS SOCIALES I", nombreCorto: "CIENCIAS SOCIALES I", semestre: 1 },
    { codigo: "103", nombreCompleto: "CULTURA DIGITAL I", nombreCorto: "CULTURA DIGITAL I", semestre: 1 },
    { codigo: "104", nombreCompleto: "PENSAMIENTO MATEMÁTICO I", nombreCorto: "PENSAMIENTO MATEMÁTICO I", semestre: 1 },
    { codigo: "105", nombreCompleto: "LENGUA Y COMUNICACIÓN I", nombreCorto: "LENGUA Y COMUNICACIÓN I", semestre: 1 },
    { codigo: "106", nombreCompleto: "INGLÉS I", nombreCorto: "INGLÉS I", semestre: 1 },
    { codigo: "107", nombreCompleto: "HUMANIDADES I", nombreCorto: "HUMANIDADES I", semestre: 1 },
    { codigo: "108", nombreCompleto: "LABORATORIO DE INVESTIGACIÓN", nombreCorto: "LABORATORIO DE INVESTIGACIÓN", semestre: 1 },
    { codigo: "109", nombreCompleto: "CURRÍCULUM AMPLIADO (RECURSOS SOCIEMOCIONALES I)", nombreCorto: "CURRÍCULUM AMPLIADO I", semestre: 1 },

    // --- SEGUNDO SEMESTRE ---
    { codigo: "201", nombreCompleto: "CONSERVACIÓN DE LA ENERGÍA Y SUS INTERACCIONES CON LA MATERIA", nombreCorto: "CONSERVACIÓN DE LA ENERGÍA", semestre: 2 },
    { codigo: "202", nombreCompleto: "CIENCIAS SOCIALES II", nombreCorto: "CIENCIAS SOCIALES II", semestre: 2 },
    { codigo: "203", nombreCompleto: "CULTURA DIGITAL II", nombreCorto: "CULTURA DIGITAL II", semestre: 2 },
    { codigo: "204", nombreCompleto: "PENSAMIENTO MATEMÁTICO II", nombreCorto: "PENSAMIENTO MATEMÁTICO II", semestre: 2 },
    { codigo: "205", nombreCompleto: "LENGUA Y COMUNICACIÓN II", nombreCorto: "LENGUA Y COMUNICACIÓN II", semestre: 2 },
    { codigo: "206", nombreCompleto: "INGLÉS II", nombreCorto: "INGLÉS II", semestre: 2 },
    { codigo: "207", nombreCompleto: "HUMANIDADES II", nombreCorto: "HUMANIDADES II", semestre: 2 },
    { codigo: "208", nombreCompleto: "TALLER DE CIENCIAS I", nombreCorto: "TALLER DE CIENCIAS I", semestre: 2 },
    { codigo: "209", nombreCompleto: "CURRÍCULUM AMPLIADO II", nombreCorto: "CURRÍCULUM AMPLIADO II", semestre: 2 },

    // --- TERCER SEMESTRE ---
    { codigo: "301", nombreCompleto: "ECOSISTEMAS, INTERACCIONES, ENERGÍA Y DINÁMICA", nombreCorto: "ECOSISTEMAS Y ENERGÍA", semestre: 3 },
    { codigo: "302", nombreCompleto: "PENSAMIENTO MATEMÁTICO III", nombreCorto: "PENSAMIENTO MATEMÁTICO III", semestre: 3 },
    { codigo: "303", nombreCompleto: "LENGUA Y COMUNICACIÓN III", nombreCorto: "LENGUA Y COMUNICACIÓN III", semestre: 3 },
    { codigo: "304", nombreCompleto: "INGLÉS III", nombreCorto: "INGLÉS III", semestre: 3 },
    { codigo: "305", nombreCompleto: "HUMANIDADES III", nombreCorto: "HUMANIDADES III", semestre: 3 },
    { codigo: "306", nombreCompleto: "TALLER DE CIENCIAS II", nombreCorto: "TALLER DE CIENCIAS II", semestre: 3 },
    { codigo: "307", nombreCompleto: "EPIDEMIOLOGÍA", nombreCorto: "EPIDEMIOLOGÍA", semestre: 3 },
    { codigo: "308", nombreCompleto: "BASES ANATÓMICAS Y FISIOLÓGICAS Y EL PROCESO SALUD - ENFERMEDAD", nombreCorto: "BASES ANATÓMICAS Y SALUD", semestre: 3 },
    { codigo: "309", nombreCompleto: "CURRÍCULUM AMPLIADO III", nombreCorto: "CURRÍCULUM AMPLIADO III", semestre: 3 },

    // --- CUARTO SEMESTRE ---
    { codigo: "401", nombreCompleto: "REACCIONES QUÍMICAS: CONSERVACIÓN DE LA MATERIA EN LA FORMACIÓN DE NUEVAS SUSTANCIAS", nombreCorto: "REACCIONES QUÍMICAS", semestre: 4 },
    { codigo: "402", nombreCompleto: "CONCIENCIA HISTÓRICA I. PERSPECTIVAS DEL MÉXICO ANTIGUO. LOS CONTEXTOS GLOBALES", nombreCorto: "CONCIENCIA HISTÓRICA I", semestre: 4 },
    { codigo: "403", nombreCompleto: "TALLER DE CULTURA DIGITAL", nombreCorto: "TALLER DE CULTURA DIGITAL", semestre: 4 },
    { codigo: "404", nombreCompleto: "TEMAS SELECTOS DE MATEMÁTICAS I", nombreCorto: "TEMAS SELECTOS DE MAT. I", semestre: 4 },
    { codigo: "405", nombreCompleto: "PENSAMIENTO LITERARIO", nombreCorto: "PENSAMIENTO LITERARIO", semestre: 4 },
    { codigo: "406", nombreCompleto: "INGLÉS IV", nombreCorto: "INGLÉS IV", semestre: 4 },
    { codigo: "407", nombreCompleto: "ESPACIO Y SOCIEDAD", nombreCorto: "ESPACIO Y SOCIEDAD", semestre: 4 },
    { codigo: "408", nombreCompleto: "CIENCIAS SOCIALES III", nombreCorto: "CIENCIAS SOCIALES III", semestre: 4 },
    { codigo: "409", nombreCompleto: "NUTRICIÓN", nombreCorto: "NUTRICIÓN", semestre: 4 },
    { codigo: "410", nombreCompleto: "SALUD PÚBLICA", nombreCorto: "SALUD PÚBLICA", semestre: 4 },
    { codigo: "411", nombreCompleto: "CURRÍCULUM AMPLIADO IV", nombreCorto: "CURRÍCULUM AMPLIADO IV", semestre: 4 },

    // --- QUINTO SEMESTRE ---
    { codigo: "501", nombreCompleto: "LA ENERGÍA EN LOS PROCESOS DE LA VIDA DIARIA", nombreCorto: "LA ENERGÍA EN LA VIDA DIARIA", semestre: 5 },
    { codigo: "502", nombreCompleto: "CONCIENCIA HISTÓRICA II. MÉXICO DURANTE EL EXPANSIONISMO CAPITALISTA", nombreCorto: "CONCIENCIA HISTÓRICA II", semestre: 5 },
    { codigo: "503", nombreCompleto: "CIENCIAS DE LA SALUD I", nombreCorto: "CIENCIAS DE LA SALUD I", semestre: 5 },
    { codigo: "504", nombreCompleto: "TEMAS SELECTOS DE BIOLOGÍA I", nombreCorto: "TEMAS SELECTOS DE BIO. I", semestre: 5 },
    { codigo: "505", nombreCompleto: "ETIMOLOGÍA GRECOLATINA I", nombreCorto: "ETIMOLOGÍA GRECOLATINA I", semestre: 5 },
    { codigo: "506", nombreCompleto: "PSICOLOGÍA I", nombreCorto: "PSICOLOGÍA I", semestre: 5 },
    { codigo: "507", nombreCompleto: "TÉCNICAS CLÍNICAS I", nombreCorto: "TÉCNICAS CLÍNICAS I", semestre: 5 },
    { codigo: "508", nombreCompleto: "SALUD SEXUAL Y REPRODUCTIVA", nombreCorto: "SALUD SEXUAL Y REPRODUCTIVA", semestre: 5 },
    { codigo: "509", nombreCompleto: "CURRÍCULUM AMPLIADO V", nombreCorto: "CURRÍCULUM AMPLIADO V", semestre: 5 },

    // --- SEXTO SEMESTRE ---
    { codigo: "601", nombreCompleto: "ORGANISMOS: ESTRUCTURAS Y PROCESOS, HERENCIA Y EVOLUCIÓN BIOLÓGICA", nombreCorto: "ORGANISMOS Y EVOLUCIÓN", semestre: 6 },
    { codigo: "602", nombreCompleto: "CONCIENCIA HISTÓRICA III. LA REALIDAD ACTUAL EN PERSPECTIVA HISTÓRICA", nombreCorto: "CONCIENCIA HISTÓRICA III", semestre: 6 },
    { codigo: "603", nombreCompleto: "TEMAS SELECTOS DE MATEMÁTICAS II", nombreCorto: "TEMAS SELECTOS DE MAT. II", semestre: 6 },
    { codigo: "604", nombreCompleto: "CIENCIAS DE LA SALUD II", nombreCorto: "CIENCIAS DE LA SALUD II", semestre: 6 },
    { codigo: "605", nombreCompleto: "TEMAS SELECTOS DE BIOLOGÍA II", nombreCorto: "TEMAS SELECTOS DE BIO. II", semestre: 6 },
    { codigo: "606", nombreCompleto: "ETIMOLOGÍA GRECOLATINA II", nombreCorto: "ETIMOLOGÍA GRECOLATINA II", semestre: 6 },
    { codigo: "607", nombreCompleto: "PSICOLOGÍA II", nombreCorto: "PSICOLOGÍA II", semestre: 6 },
    { codigo: "608", nombreCompleto: "CUIDADO DEL PACIENTE GERIÁTRICO", nombreCorto: "PACIENTE GERIÁTRICO", semestre: 6 },
    { codigo: "609", nombreCompleto: "TÉCNICAS CLÍNICAS II", nombreCorto: "TÉCNICAS CLÍNICAS II", semestre: 6 },
    { codigo: "610", nombreCompleto: "CURRÍCULUM AMPLIADO VI", nombreCorto: "CURRÍCULUM AMPLIADO VI", semestre: 6 },
  ];

  // Mapa auxiliar de materias registradas
  const materiasMap: Record<string, number> = {};

  for (const m of materiasData) {
    const materiaRegistrada = await prisma.materia.upsert({
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

    materiasMap[m.codigo] = materiaRegistrada.id;
  }

  // 11. Definición de Seriación
  const seriacionesData = [
    // Cadenas de Seriación Directa
    { materia: "202", prerrequisito: "102" },
    { materia: "408", prerrequisito: "202" },
    { materia: "203", prerrequisito: "103" },
    { materia: "403", prerrequisito: "203" },
    { materia: "204", prerrequisito: "104" },
    { materia: "302", prerrequisito: "204" },
    { materia: "404", prerrequisito: "302" },
    { materia: "603", prerrequisito: "404" },
    { materia: "205", prerrequisito: "105" },
    { materia: "303", prerrequisito: "205" },
    { materia: "206", prerrequisito: "106" },
    { materia: "304", prerrequisito: "206" },
    { materia: "406", prerrequisito: "304" },
    { materia: "207", prerrequisito: "107" },
    { materia: "305", prerrequisito: "207" },
    { materia: "306", prerrequisito: "208" },
    { materia: "502", prerrequisito: "402" },
    { materia: "602", prerrequisito: "502" },
    { materia: "604", prerrequisito: "503" },
    { materia: "605", prerrequisito: "504" },
    { materia: "606", prerrequisito: "505" },
    { materia: "607", prerrequisito: "506" },
    { materia: "609", prerrequisito: "507" },

    // Seriación de Currículum Ampliado (1° a 6°)
    { materia: "209", prerrequisito: "109" },
    { materia: "309", prerrequisito: "209" },
    { materia: "411", prerrequisito: "309" },
    { materia: "509", prerrequisito: "411" },
    { materia: "610", prerrequisito: "509" },
  ];

  for (const s of seriacionesData) {
    const materiaId = materiasMap[s.materia];
    const prerrequisitoId = materiasMap[s.prerrequisito];

    if (materiaId && prerrequisitoId) {
      await prisma.seriacion.upsert({
        where: {
          materiaId_prerrequisitoMateriaId: {
            materiaId: materiaId,
            prerrequisitoMateriaId: prerrequisitoId,
          },
        },
        update: {},
        create: {
          materiaId: materiaId,
          prerrequisitoMateriaId: prerrequisitoId,
        },
      });
    }
  }

  console.log("¡Catálogos, materias, seriación y estructura de calificaciones completados exitosamente!");
}

poblar()
  .catch((e) => {
    console.error("Error al poblar catálogos:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });