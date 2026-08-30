import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

// Cargar variables de entorno del archivo .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares globales
app.use(cors());
app.use(express.json());

// Ruta de estado de la API
app.get("/api/status", (req: Request, res: Response) => {
  res.json({
    status: "success",
    message:
      "¡Backend institucional de BELVER operando correctamente con Node.js, Express y TypeScript!",
  });
});

// Inicializar el servidor en el puerto 4000
app.listen(PORT, () => {
  console.log(`Servidor institucional corriendo en el puerto ${PORT}`);
});
