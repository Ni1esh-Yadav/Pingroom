import dotenv from 'dotenv';
dotenv.config();

export const PORT = Number(process.env.PORT || 3000);
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const ORIGIN =
  process.env.NODE_ENV === "production"
    ? "https://pingroom-sand.vercel.app" // frontend on Vercel
    : "http://localhost:5173"; // frontend local
export const SESSION_SECRET = process.env.SESSION_SECRET || 'replace-session-secret';
export const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || 'localhost';
export const JWT_SECRET = process.env.JWT_SECRET || 'replace-me';
export const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || '';
export const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || '';
export const GITHUB_CALLBACK_URL = process.env.GITHUB_CALLBACK_URL || 'http://localhost:4000/auth/github/callback';