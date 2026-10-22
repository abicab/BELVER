import { Router } from "express";
import {
  obtenerCatalogos,
  obtenerCatalogoPorNombre,
  crearRegistroCatalogo,
  actualizarRegistroCatalogo,
} from "../controllers/catalogoController.js";

const router = Router();

// Rutas de lectura
router.get("/", obtenerCatalogos);
router.get("/:nombreTabla", obtenerCatalogoPorNombre);

// Rutas de escritura y actualización para el CRUD de catálogos
router.post("/:nombreTabla", crearRegistroCatalogo);
router.put("/:nombreTabla/:id", actualizarRegistroCatalogo);

export default router;
