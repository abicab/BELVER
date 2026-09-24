import { z } from "zod";

export const admissionSchema = z.object({
  // Datos Personales
  apellidoPaterno: z
    .string()
    .min(1, "El apellido paterno es obligatorio.")
    .toUpperCase(),
  apellidoMaterno: z.string().optional().nullable(),
  nombres: z.string().min(1, "El nombre es obligatorio.").toUpperCase(),
  curp: z
    .string()
    .length(18, "La CURP debe tener exactamente 18 caracteres.")
    .regex(
      /^[A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]{2}$/,
      "Estructura de CURP inválida.",
    )
    .toUpperCase(),
  fechaNacimiento: z.string().optional().nullable(),
  genero: z.string().optional().nullable(), // Sexo extraído de la CURP

  // Contacto
  correoElectronico1: z
    .string()
    .email("Correo electrónico principal inválido."),
  correoElectronico2: z
    .string()
    .email("Correo electrónico alternativo inválido.")
    .optional()
    .nullable()
    .or(z.literal("")),
  telefonoCelular: z
    .string()
    .length(10, "El teléfono celular debe ser de 10 dígitos."),
  telefonoParticular: z.string().optional().nullable().or(z.literal("")),

  // Inclusión y Diversidad
  generoIdentidad: z.string().optional().nullable(), // <--- Agregado para capturar el texto del catálogo de inclusión
  identidadCultural: z.string().optional().nullable(),

  // Discapacidades múltiples
  discapacidades: z
    .preprocess((val) => {
      if (typeof val === "string") {
        try {
          return JSON.parse(val);
        } catch {
          return [];
        }
      }
      return Array.isArray(val) ? val : [];
    }, z.array(z.string()))
    .default([]),

  // Domicilio
  pais: z
    .string()
    .transform((val) => (val ? val.toUpperCase() : "MÉXICO"))
    .default("MÉXICO"),
  codigoPostal: z.string().optional().nullable(),
  estado: z.string().min(1, "El estado es obligatorio.").toUpperCase(),
  municipio: z.string().min(1, "El municipio es obligatorio.").toUpperCase(),
  colonia: z.string().min(1, "La colonia es obligatoria.").toUpperCase(),
  calle: z.string().min(1, "La calle es obligatoria.").toUpperCase(),
  numeroExterior: z.string().optional().nullable(),
  numeroInterior: z.string().optional().nullable(),

  // Tutor
  tutorApellidoPaterno: z.string().optional().nullable(),
  tutorApellidoMaterno: z.string().optional().nullable(),
  tutorNombres: z.string().optional().nullable(),
  tutorParentesco: z.string().optional().nullable(),
  tutorTelefono: z.string().optional().nullable(),

  // Antecedentes Escolares y Modalidad
  tipoAdmision: z.enum(["nuevo_ingreso", "revalidacion"]),
  cctEscuelaProcedencia: z.string().optional().nullable(),
  nombreEscuelaProcedencia: z.string().optional().nullable(),
  sistemaProcedenciaLetra: z.string().optional().nullable(),
  otroSistemaProcedencia: z.string().optional().nullable(),
});
