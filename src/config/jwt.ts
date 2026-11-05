import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "filafacil-super-secret-key-sus-ubs-2026";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";
const JWT_REMEMBER_EXPIRES_IN = process.env.JWT_REMEMBER_EXPIRES_IN || "30d";

export interface TokenPayload {
  userId: string;
  email: string;
  cpf: string;
  role: string;
  name: string;
}

export function generateToken(payload: TokenPayload, rememberMe: boolean = false): string {
  const expiresIn = rememberMe ? JWT_REMEMBER_EXPIRES_IN : JWT_EXPIRES_IN;
  return jwt.sign(payload, JWT_SECRET, { expiresIn: expiresIn as any });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

