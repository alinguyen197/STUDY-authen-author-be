import rateLimit from 'express-rate-limit'
import { RATE_LIMIT_CONFIG } from '../utils/constants'

export const refreshTokenLimiter = rateLimit({
  windowMs: RATE_LIMIT_CONFIG.REFRESH_ENDPOINT.windowMs,
  max: RATE_LIMIT_CONFIG.REFRESH_ENDPOINT.max,
  message: 'Too many refresh requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
})
