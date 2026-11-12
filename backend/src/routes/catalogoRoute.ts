import { Router } from "express";
import {
  obtenerCatalogos,
  obtenerCatalogoPorNombre,
  crearRegistroCatalogo,
  actualizarRegistroCatalogo,
  crearDefinicionCatalogo,
} from "../controllers/catalogoController.js";

const router = Router();

// Ruta para crear la tabla física en la base de datos (Scaffolding por SQL)
router.post("/definicion", crearDefinicionCatalogo);

// Rutas para listar y gestionar registros (tanto fijos como dinámicos)
router.get("/", obtenerCatalogos);
router.get("/:nombreTabla", obtenerCatalogoPorNombre);
router.post("/:nombreTabla", crearRegistroCatalogo);
router.put("/:nombreTabla/:id", actualizarRegistroCatalogo);

export default router;
