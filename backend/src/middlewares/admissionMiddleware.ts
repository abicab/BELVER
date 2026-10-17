import { z } from "zod";

export const admissionSchema = z.object({
  // Datos Personales
  apellidoPaterno: z
    .string()
    .min(1, "El apellido paterno es obligatorio.")
    .max(30, "El apellido paterno no debe exceder los 30 caracteres.")
    .toUpperCase(),
  apellidoMaterno: z
    .string()
    .max(30, "El apellido materno no debe exceder los 30 caracteres.")
    .optional()
    .nullable()
    .or(z.literal("")),
  nombres: z
    .string()
    .min(1, "El nombre es obligatorio.")
    .max(30, "El nombre no debe exceder los 30 caracteres.")
    .toUpperCase(),
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
    .email("Correo electrónico principal inválido.")
    .max(60, "El correo electrónico no debe exceder los 60 caracteres."),
  correoElectronico2: z
    .string()
    .email("Correo electrónico alternativo inválido.")
    .max(
      60,
      "El correo electrónico alternativo no debe exceder los 60 caracteres.",
    )
    .optional()
    .nullable()
    .or(z.literal("")),
  telefonoCelular: z
    .string()
    .length(10, "El teléfono celular debe ser exactamente de 10 dígitos.")
    .regex(/^\d{10}$/, "El teléfono celular solo debe contener números."),
  telefonoParticular: z
    .string()
    .length(10, "El teléfono particular debe ser de 10 dígitos.")
    .regex(/^\d{10}$/, "El teléfono particular solo debe contener números.")
    .optional()
    .nullable()
    .or(z.literal("")),

  // Inclusión y Diversidad
  generoIdentidad: z.string().optional().nullable(),
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
  codigoPostal: z
    .string()
    .max(10, "El código postal no debe exceder los 10 caracteres.")
    .optional()
    .nullable(),
  estado: z.string().min(1, "El estado es obligatorio.").max(50).toUpperCase(),
  municipio: z
    .string()
    .min(1, "El municipio es obligatorio.")
    .max(50)
    .toUpperCase(),
  colonia: z
    .string()
    .min(1, "La colonia es obligatoria.")
    .max(100)
    .toUpperCase(),
  calle: z.string().min(1, "La calle es obligatoria.").max(100).toUpperCase(),
  numeroExterior: z
    .string()
    .max(10, "El número exterior no debe exceder los 10 caracteres.")
    .optional()
    .nullable()
    .or(z.literal("")),
  numeroInterior: z
    .string()
    .max(10, "El número interior no debe exceder los 10 caracteres.")
    .optional()
    .nullable()
    .or(z.literal("")),

  // Tutor
  tutorApellidoPaterno: z
    .string()
    .max(30, "El apellido del tutor no debe exceder los 30 caracteres.")
    .optional()
    .nullable()
    .or(z.literal("")),
  tutorApellidoMaterno: z
    .string()
    .max(30, "El apellido materno del tutor no debe exceder los 30 caracteres.")
    .optional()
    .nullable()
    .or(z.literal("")),
  tutorNombres: z
    .string()
    .max(30, "El nombre del tutor no debe exceder los 30 caracteres.")
    .optional()
    .nullable()
    .or(z.literal("")),
  tutorParentesco: z.string().optional().nullable(),
  tutorTelefono: z
    .string()
    .length(10, "El teléfono del tutor debe ser de 10 dígitos.")
    .regex(/^\d{10}$/, "El teléfono del tutor solo debe contener números.")
    .optional()
    .nullable()
    .or(z.literal("")),

  // Antecedentes Escolares y Modalidad
  tipoAdmision: z.enum(["nuevo_ingreso", "revalidacion"]),
  cctEscuelaProcedencia: z.string().max(20).optional().nullable(),
  nombreEscuelaProcedencia: z.string().max(150).optional().nullable(),
  sistemaProcedenciaLetra: z.string().optional().nullable(),
  otroSistemaProcedencia: z.string().max(100).optional().nullable(),
});
