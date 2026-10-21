import { Router } from "express";
import { obtenerDatosReportes } from "../controllers/alumnosCEController";

const router = Router();

// Endpoint exclusivo para el módulo de reportes institucionales
router.get("/", obtenerDatosReportes);

export default router;
