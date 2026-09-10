import { Router } from "express";
import {
  registrarAspirante,
  consultarEstatus,
  verificarDuplicado,
  actualizarDocumentoAspirante,
  aprobarYGenerarCredenciales,
} from "../controllers/admissionController.js";
import { upload } from "../middlewares/uploadMiddleware.js";

const router = Router();

router.get("/verificar-duplicado", verificarDuplicado);
router.get("/consulta", consultarEstatus);

// Ruta de registro con el middleware de Multer para capturar los archivos
router.post(
  "/registro",
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "actaNacimiento", maxCount: 1 },
    { name: "curpFile", maxCount: 1 },
    { name: "studyCert", maxCount: 1 },
    { name: "constanciaEstudios", maxCount: 1 },
  ]),
  registrarAspirante,
);

// Ruta para actualizar documentos individuales con Multer
router.put(
  "/actualizar-documento",
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "actaNacimiento", maxCount: 1 },
    { name: "curpFile", maxCount: 1 },
    { name: "studyCert", maxCount: 1 },
    { name: "constanciaEstudios", maxCount: 1 },
  ]),
  actualizarDocumentoAspirante,
);

// Ruta para aprobar aspirante y generar matrícula/contraseña (Protegida para administradores)
router.patch("/aspirantes/:id/aprobar", aprobarYGenerarCredenciales);

export default router;
