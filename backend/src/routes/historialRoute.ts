import { Router } from "express";
import {
  getAlumnosHistorial,
  getPlanesEstudioConMaterias,
  getHistorialPorAlumno,
  asignarMateriasHistorial,
} from "../controllers/historialController";

const router = Router();

router.get("/alumnos", getAlumnosHistorial);
router.get("/planes", getPlanesEstudioConMaterias);
router.get("/alumno/:aspiranteId", getHistorialPorAlumno);
router.post("/asignar", asignarMateriasHistorial);

export default router;