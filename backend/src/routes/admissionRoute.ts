import { Router } from "express";
import {
  registrarAspirante,
  verificarDuplicado,
  consultarEstatus,
} from "../controllers/admissionController.js";
import { upload } from "../middlewares/uploadMiddleware.js"; // O tu configuración de multer

const router = Router();

router.get("/verificar-duplicado", verificarDuplicado);
router.get("/consulta", consultarEstatus);

// ESTA ES LA RUTA CRÍTICA QUE DEBE RECIBIR TODOS LOS CAMPOS DE ARCHIVOS:
router.post(
  "/registro",
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "actaNacimiento", maxCount: 1 },
    { name: "curpFile", maxCount: 1 },
    { name: "ineDocument", maxCount: 1 },
    { name: "studyCert", maxCount: 1 },
    { name: "constanciaEstudios", maxCount: 1 },
  ]),
  registrarAspirante,
);

export default router;
