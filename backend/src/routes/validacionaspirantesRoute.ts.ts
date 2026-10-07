import { Router } from "express";
import {
  obtenerAspirantesControlEscolar,
  actualizarEstatusDocumentoControl,
  aprobarYGenerarCredencialesControl,
  verDocumentoControl,
  emitirObservacionesControl,
} from "../controllers/validacionaspirantesController.js";
import { obtenerAlumnosActivos } from "../controllers/alumnosCEController.js";

const router = Router();

// 1. IMPORTANTE: Las rutas estáticas (/alumnos) van siempre PRIMERO que las dinámicas (/:id)
router.get("/alumnos", obtenerAlumnosActivos);

// 2. Rutas de aspirantes y validación
router.get("/aspirantes", obtenerAspirantesControlEscolar);
router.patch(
  "/documentos/:documentoId/estatus",
  actualizarEstatusDocumentoControl,
);
router.get("/documentos/:documentoId/ver", verDocumentoControl);
router.patch("/aspirantes/:id/aprobar", aprobarYGenerarCredencialesControl);
router.patch("/aspirantes/:id/observaciones", emitirObservacionesControl);

export default router;
