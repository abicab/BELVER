import multer from "multer";

// Usamos memoryStorage para procesar el archivo en memoria RAM sin escribir en disco
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Límite de seguridad de 5MB
  },
});
