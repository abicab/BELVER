import { Router } from "express";
import { obtenerCatalogos } from "../controllers/catalogController.js";

const router = Router();

router.get("/", obtenerCatalogos);

export default router;
