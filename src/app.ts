import express from "express";
import cors from "cors";
import path from "path";
import router from "./routes";
import { errorHandler } from "./middlewares/error.middleware";

const app = express();

// Configuração de CORS (frontend Vite/React local ou em produção)
const allowedOrigin = process.env.CLIENT_ORIGIN || "*";
app.use(
  cors({
    origin: allowedOrigin === "*" ? "*" : allowedOrigin.split(","),
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// Middleware para processar JSON e formulários
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos (uploads de avatares, fotos)
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

// Rotas da aplicação
app.use(router);

// Middleware de tratamento global de erros
app.use(errorHandler);

// Rota 404 para endpoints não encontrados
app.use((req, res) => {
  res.status(404).json({ error: `Rota não encontrada: ${req.method} ${req.originalUrl}` });
});

export default app;
