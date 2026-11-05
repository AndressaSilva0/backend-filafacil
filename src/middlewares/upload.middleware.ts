import multer from "multer";
import path from "path";
import fs from "fs";

let uploadDir = path.resolve(process.cwd(), "uploads", "avatars");

try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch {
  // Fallback seguro para /tmp caso o ambiente de contêiner restrinja escrita em /app
  const fallbackDir = path.resolve("/tmp", "uploads", "avatars");
  try {
    if (!fs.existsSync(fallbackDir)) {
      fs.mkdirSync(fallbackDir, { recursive: true });
    }
    uploadDir = fallbackDir;
  } catch (err) {
    console.warn("Aviso: Falha ao inicializar diretório de uploads:", err);
  }
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `avatar-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

export const uploadAvatar = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Apenas arquivos de imagem são permitidos."));
    }
  },
});
