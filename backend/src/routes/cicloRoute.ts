import { Router } from "express";
import {
  obtenerCiclos,
  crearCiclo,
  actualizarCiclo,
  eliminarCiclo,
} from "../controllers/cicloController.js";

const router = Router();

router.get("/", obtenerCiclos);
router.post("/", crearCiclo);
router.put("/:id", actualizarCiclo);
router.delete("/:id", eliminarCiclo);

export default router;
