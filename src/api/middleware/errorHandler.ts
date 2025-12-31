import { Request, Response, NextFunction } from 'express';
import logger from '../../config/logger';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error('Error:', err);

  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  
  res.status(statusCode).json({
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

export const notFound = (_req: Request, res: Response, _next: NextFunction): void => {
  res.status(404).json({ error: 'Route not found' });
};
