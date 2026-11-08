import { Router } from "express";
import {
  getPerfilAlumno,
  verDocumentoControl,
} from "../controllers/alumnoController";

const router = Router();

// Mantener esta ruta antes de "/:id" para que no se interprete "documento" como ID.
router.get("/documento/:documentoId", verDocumentoControl);

// Perfil completo del alumno: GET /api/alumno/:id
router.get("/:id", getPerfilAlumno);

export default router;
