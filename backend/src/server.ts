import express, { Application } from "express";
import cors from "cors";
import admissionRoutes from "./routes/admissionRoute"; // Incluye la extensión .ts por NodeNext

const app: Application = express();
const PORT = process.env.PORT || 4000;

// Middlewares globales
app.use(cors());
app.use(express.json());

// Montaje de Rutas de la API
app.use("/api/admission", admissionRoutes);

// Ruta de prueba para verificar estado del servidor
app.get("/", (req, res) => {
  res.json({ ok: true, mensaje: "API de BELVER funcionando correctamente 🚀" });
});

// Arrancar el servidor
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});
