import express from "express";
import cors from "cors";
import path from "path";
import router from "./routes";
import { errorHandler } from "./middlewares/error.middleware";

const app = express();

// Configuração de CORS (suporte a Vercel, Render e desenvolvimento local)
const allowedOrigin = process.env.CLIENT_ORIGIN;
app.use(
  cors({
    origin: (origin, callback) => {
      // Permite requisições sem origin (como mobile apps, curl, Swagger, tarefas internas)
      if (!origin) return callback(null, true);
      
      // Se configurado com origens específicas separadas por vírgula
      if (allowedOrigin && allowedOrigin !== "*") {
        const allowedList = allowedOrigin.split(",").map((o) => o.trim());
        if (allowedList.includes(origin)) {
          return callback(null, true);
        }
      }
      
      // Permite dinamicamente o origin requisitante garantindo compatibilidade com credentials: true
      return callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// Middleware para processar JSON e formulários
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos (uploads de avatares, fotos) com fallback
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));
app.use("/uploads", express.static(path.resolve("/tmp", "uploads")));

// Rotas da aplicação
app.use(router);

// Middleware de tratamento global de erros
app.use(errorHandler);

// Rota 404 para endpoints não encontrados
app.use((req, res) => {
  res.status(404).json({ error: `Rota não encontrada: ${req.method} ${req.originalUrl}` });
});

export default app;
