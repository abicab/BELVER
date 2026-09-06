import express from "express";
import cors from "cors";
import admissionRoutes from "./routes/admissionRoute";
import catalogRoute from "./routes/catalogRoute";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Ruta de Catalogos
app.use("/api/catalogo", catalogRoute);

// Montar las rutas de inscripción
app.use("/api/admission", admissionRoutes);

app.get("/", (req, res) => {
  res.json({ ok: true, mensaje: "API de BELVER funcionando correctamente 🚀" });
});

app.listen(PORT, () => {
  console.log(`Servidor institucional corriendo en el puerto ${PORT}`);
});
