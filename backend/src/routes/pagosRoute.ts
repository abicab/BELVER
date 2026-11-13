// backend/src/routes/pagosRoutes.ts
import { Router } from "express";
import {
  buscarEstudiantesPagos,
  obtenerPagosRecientes,
  registrarPago,
} from "../controllers/pagosController.js";

const router = Router();

router.get("/estudiantes", buscarEstudiantesPagos);
router.get("/", obtenerPagosRecientes);
router.post("/", registrarPago);

export default router;
