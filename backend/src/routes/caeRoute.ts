import { Router } from "express";
import {
  obtenerExpedientesCAE,
  actualizarEstatusExpediente,
} from "../controllers/caeController.js";

const router = Router();

router.get("/expedientes", obtenerExpedientesCAE);
router.put("/expedientes/:id", actualizarEstatusExpediente);

export default router;
