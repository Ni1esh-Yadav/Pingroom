import express from 'express';
import http from 'http';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';
import session from 'express-session';
import authRoutes from './routes/auth';
import reportRoutes from './routes/report';
import { createSignalingServer } from './wsSignaling';
import { PORT, ORIGIN, NODE_ENV, SESSION_SECRET } from './config';
import { createApiLimiter } from './utils/rateLimiter';
import { log } from './logger';
const app = express();
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
import { Request, Response } from "express";

// CORS - allow credentials so cookies/session can be sent from frontend
app.use(
  cors({
    origin:[ORIGIN,"https://pingroom-sand.vercel.app",],
    credentials: true,
  })
);

// Session middleware (NEW) - required for passport session-based auth
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // set to true if using HTTPS in production
      sameSite: 'lax',
      domain: undefined, // set if you need a specific cookie domain
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  })
);



app.use(createApiLimiter);

app.use('/auth', authRoutes);
app.use('/reports', reportRoutes);


app.get('/health', (req: Request, res: Response) => res.json({ ok: true, env: NODE_ENV }));

const server = http.createServer(app);
createSignalingServer(server);

server.listen(PORT, () => {
  log(`Server listening on localhost:${PORT}`);
});