import jwt from 'jsonwebtoken';
import { JWT_SECRET } from './config';

export type JwtUser = {
  id: number;
  login: string;
  avatar_url?: string;
  html_url?: string;
};

export function signUser(user: JwtUser) {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtUser;
  } catch (e) {
    return null;
  }
}