import { Router } from "express";
import {
  obtenerCatalogos,
  obtenerCatalogoPorNombre,
} from "../controllers/catalogoController.js";

const router = Router();

router.get("/", obtenerCatalogos);
router.get("/:nombreTabla", obtenerCatalogoPorNombre);

export default router;
