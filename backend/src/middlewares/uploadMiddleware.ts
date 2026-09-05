import multer from "multer";
import path from "path";
import fs from "fs";

// Asegurar que la carpeta de subidas exista en el directorio de trabajo
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de almacenamiento local para los archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// Middleware de Multer configurado para los campos específicos del formulario de admisión
export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Límite estricto de 5 MB por archivo
}).fields([
  { name: "photo", maxCount: 1 },
  { name: "actaNacimiento", maxCount: 1 },
  { name: "curpFile", maxCount: 1 },
  { name: "studyCert", maxCount: 1 },
  { name: "constanciaEstudios", maxCount: 1 },
]);
