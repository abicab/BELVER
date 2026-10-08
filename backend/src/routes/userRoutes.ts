import { Router } from "express";
import {
  obtenerTodosLosUsuarios,
  cambiarRolUsuario,
  cambiarEstatusUsuario,
  crearUsuarioManual,
} from "../controllers/usuariosController.js";

const router = Router();

router.get("/", obtenerTodosLosUsuarios);
router.post("/", crearUsuarioManual);
router.patch("/:tipoTabla/:id/rol", cambiarRolUsuario);
router.patch("/:tipoTabla/:id/estatus", cambiarEstatusUsuario);

export default router;