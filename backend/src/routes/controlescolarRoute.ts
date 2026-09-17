import { Router } from "express";
import {
  obtenerAspirantesControlEscolar,
  actualizarEstatusDocumentoControl,
  aprobarYGenerarCredencialesControl,
  verDocumentoControl,
  emitirObservacionesControl,
} from "../controllers/controlescolarController.js";

const router = Router();

router.get("/aspirantes", obtenerAspirantesControlEscolar);
router.patch(
  "/documentos/:documentoId/estatus",
  actualizarEstatusDocumentoControl,
);
router.patch("/aspirantes/:id/aprobar", aprobarYGenerarCredencialesControl);
router.get("/documentos/:documentoId/ver", verDocumentoControl);
// Ruta para enviar observaciones de corrección
router.patch("/aspirantes/:id/observaciones", emitirObservacionesControl);

export default router;
