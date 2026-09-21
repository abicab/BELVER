import express from "express";
import cors from "cors";
import admissionRoute from "./routes/admissionRoute";
import catalogoRoute from "./routes/catalogoRoute";
import controlescolarRoute from "./routes/controlescolarRoute";
import studyPlanRoutes from "./routes/studyPlanRoutes";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// ... dentro de tus middlewares de rutas:
app.use("/api/controlescolar", controlescolarRoute);

// Ruta de Catalogos
app.use("/api/catalogo", catalogoRoute);

// Montar las rutas de inscripción
app.use("/api/admission", admissionRoute);

// ruta de planes
app.use("/api/planes", studyPlanRoutes);

app.get("/", (req, res) => {
  res.json({ ok: true, mensaje: "API de BELVER funcionando correctamente" });
});

app.listen(PORT, () => {
  console.log(`Servidor institucional corriendo en el puerto ${PORT}`);
});
