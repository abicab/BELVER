import { z } from "zod";

export const admissionSchema = z.object({
  apellidoPaterno: z.string().min(1, "El apellido paterno es requerido"),
  apellidoMaterno: z.string().optional().nullable(),
  nombres: z.string().min(1, "El nombre es requerido"),
  curp: z.string().length(18, "La CURP debe tener 18 caracteres"),
  correoElectronico1: z.string().email("Correo electrónico inválido"),
  correoElectronico2: z
    .string()
    .email("Correo electrónico inválido")
    .optional()
    .nullable()
    .or(z.literal("")),
  telefonoCelular: z
    .string()
    .length(10, "El teléfono celular debe tener 10 dígitos"),
  telefonoParticular: z.string().optional().nullable().or(z.literal("")),
  generoIdentidad: z.string().optional().nullable(),
  identidadCultural: z.string().optional().nullable(),
  tieneDiscapacidad: z.string().default("NO"),
  apoyoEducativo: z.string().default("NO"),
  situacionLaboral: z.string().optional().nullable(),
  cuentaComputadora: z.string().default("SÍ"),
  cuentaInternet: z.string().default("SÍ"),
  medioEnterado: z.string().optional().nullable(),
  pais: z.string().default("MÉXICO"),
  codigoPostal: z.string().length(5, "El código postal debe tener 5 dígitos"),
  estado: z.string().min(1, "El estado es requerido"),
  municipio: z.string().min(1, "El municipio es requerido"),
  colonia: z.string().min(1, "La colonia es requerida"),
  calle: z.string().min(1, "La calle es requerida"),
  numeroExterior: z.string().optional().nullable(),
  numeroInterior: z.string().optional().nullable(),
  tutorApellidoPaterno: z.string().optional().nullable(),
  tutorApellidoMaterno: z.string().optional().nullable(),
  tutorNombres: z.string().optional().nullable(),
  tutorParentesco: z.string().optional().nullable(),
  tutorTelefono: z.string().optional().nullable().or(z.literal("")), // 👈 100% en español
  tipoAdmision: z.enum(["nuevo_ingreso", "revalidacion"]),
  tipoSecundaria: z.string().optional().nullable(),
  cctEscuelaProcedencia: z.string().optional().nullable(),
  nombreEscuelaProcedencia: z.string().optional().nullable(),
  estadoEscuelaProcedencia: z.string().optional().nullable(),
  promedioSecundaria: z.string().optional().nullable(),
  sistemaBachilleratoPrevio: z.string().optional().nullable(),
  otroSistemaProcedencia: z.string().optional().nullable(),
  previousSchoolCct: z.string().optional().nullable(),
  previousHighSchoolName: z.string().optional().nullable(),
  previousSchoolState: z.string().optional().nullable(),
  tipoEstudiante: z.string().optional().nullable(),
  currentSemester: z.string().optional().nullable(),
  studyPlan: z.string().optional().nullable(),
});
