import { Router } from 'express';
import { getPlanes, createPlanEstudio, inscribirMateriasModulo } from "../controllers/studyPlanController";

const router = Router();

router.get("/", getPlanes);
router.post("/", createPlanEstudio);
router.post("/inscribir-modulo", inscribirMateriasModulo);

export default router;