import { Router } from "express";
import {
  getPerfilAlumno,
  verDocumentoControl,
} from "../controllers/alumnoController";

const router = Router();

// Esta ruta debe registrarse antes de "/:id".
router.get("/documento/:documentoId", verDocumentoControl);

// Perfil del alumno: GET /api/alumno/:id
router.get("/:id", getPerfilAlumno);

export default router;
