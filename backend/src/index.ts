import express from "express";
import cors from "cors";
import admissionRoute from "./routes/admissionRoute";
import studyPlanRoutes from "./routes/studyPlanRoutes";
import validacionaspirantesRoute from "./routes/validacionaspirantesRoute.ts";
import userRoutes from "./routes/userRoutes.js"; // 1. IMPORTAR LA RUTA DE USUARIOS
import historialRoutes from "./routes/historialRoute.js";
import alumnosCERouter from "./routes/alumnosCERouter";
import reportesRoutes from "./routes/reportesRoutes";
import cicloRoutes from "./routes/cicloRoute.js";
import catalogoRoute from "./routes/catalogoRoute.js";
import alumnoRoute from "./routes/alumnoRoute.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Montar las rutas de ciclos escolares
app.use("/api/ciclos", cicloRoutes);

// Ruta para obtener datos de reportes institucionales
app.use("/api/controlescolar/reportes", reportesRoutes);

// Montar las rutas de alumnos del control escolar
app.use("/api/controlescolar", alumnosCERouter);

// CAMBIAMOS ESTA LÍNEA para que coincida exactamente con el frontend (/api/controlescolar)
app.use("/api/controlescolar", validacionaspirantesRoute);

// Ruta de Catálogos
app.use("/api/catalogo", catalogoRoute);

// Montar las rutas de inscripción
app.use("/api/admission", admissionRoute);

// Ruta de planes
app.use("/api/planes", studyPlanRoutes);

// 2. MONTAR LA RUTA DE GESTIÓN DE USUARIOS Y ACCESOS RBAC
app.use("/api/usuarios", userRoutes);

// Ruta Historial
app.use("/api/historial", historialRoutes);

// Ruta alumno
app.use("/api/alumno", alumnoRoute);

app.get("/", (req, res) => {
  res.json({ ok: true, mensaje: "API de BELVER funcionando correctamente" });
});

app.listen(PORT, () => {
  console.log(`Servidor institucional corriendo en el puerto ${PORT}`);
});
