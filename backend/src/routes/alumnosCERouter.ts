import { Router } from "express";
import { obtenerAlumnosActivos } from "../controllers/alumnosCEController.js";
// ... (tus otras importaciones de aspirantes, etc.)

const router = Router();

// Agrega esta línea para que responda a http://localhost:4000/api/controlescolar/alumnos
router.get("/alumnos", obtenerAlumnosActivos);

// ... (tus otras rutas existentes de aspirantes, documentos, etc.)

export default router;
