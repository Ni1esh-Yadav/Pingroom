import rateLimit from 'express-rate-limit';

export const createApiLimiter = rateLimit({
  windowMs: 1000 * 60, // 1 minute
  max: 60, // per minute
  standardHeaders: true,
  legacyHeaders: false,
});