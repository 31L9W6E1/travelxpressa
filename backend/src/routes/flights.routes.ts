import { Router, type Request, type Response } from 'express';
import { rateLimit } from '../middleware/rateLimit';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../middleware/errorHandler';
import { flightSearchSchema, type FlightSearchInput } from '../validation/schemas';
import { KiwiServiceError, searchKiwiFlights } from '../services/kiwi.service';
import { logger } from '../utils/logger';

const router = Router();

const flightSearchRateLimit = rateLimit({
  windowMs: 60 * 1000,
  maxRequests: 10,
  message: 'Too many flight searches. Please try again in a minute.',
  keyGenerator: (req) => req.ip || req.socket.remoteAddress || 'unknown',
  onLimitReached: (req) => {
    logger.security('Flight search rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      method: req.method,
    });
  },
});

router.post(
  '/search',
  flightSearchRateLimit,
  validate({ body: flightSearchSchema }),
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const body = req.body as FlightSearchInput;
      const flights = await searchKiwiFlights(body);

      res.json({
        success: true,
        data: { flights },
      });
    } catch (error: unknown) {
      if (error instanceof KiwiServiceError) {
        return res.status(error.statusCode).json({
          success: false,
          error: error.message,
          code: error.code,
          data: { flights: [] },
        });
      }

      throw error;
    }
  })
);

export default router;
