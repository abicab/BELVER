// backend/src/routes/admissionRoute.ts
import { Router } from "express";
import {
  registrarAspirante,
  verificarDuplicado,
  consultarEstatus,
  actualizarDocumentoAspirante,
} from "../controllers/admissionController.js";
import { obtenerCatalogos } from "../controllers/catalogController.js";
import { uploadMiddleware } from "../middlewares/uploadMiddleware.js";

const router = Router();

// Ruta de catálogos (Debe estar arriba para evitar conflictos)
router.get("/catalogos", obtenerCatalogos);

router.get("/verificar-duplicado", verificarDuplicado);
router.get("/consulta", consultarEstatus);
router.post("/registro", uploadMiddleware, registrarAspirante);
router.put(
  "/actualizar-documento",
  uploadMiddleware,
  actualizarDocumentoAspirante,
);

export default router;
