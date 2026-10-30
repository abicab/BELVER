import { Router } from 'express';
import {
  getPlanes,
  createPlanEstudio,
  updatePlanEstudio,
  inscribirMateriasModulo,
} from "../controllers/studyPlanController";

const router = Router();

router.get("/", getPlanes);
router.post("/", createPlanEstudio);
router.put("/:id", updatePlanEstudio);
router.post("/inscribir-modulo", inscribirMateriasModulo);

export default router;
