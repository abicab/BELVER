import { Router } from "express";
import {
  obtenerCatalogos,
  obtenerCatalogoPorNombre,
} from "../controllers/catalogoController.js";
import { validarCatalogoExistente } from "../middlewares/catalogoMiddleware.js";

const router = Router();
router.get("/", obtenerCatalogos);
router.get("/:nombreTabla", validarCatalogoExistente, obtenerCatalogoPorNombre);

export default router;
