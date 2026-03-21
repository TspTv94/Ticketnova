/**
 * TicketNova — Error Handler Middleware
 * File: backend/src/middleware/errorHandler.js
 */

const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${err.stack}`);

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

const notFound = (req, res, next) => {
  const err = new Error(`Not Found — ${req.originalUrl}`);
  err.statusCode = 404;
  next(err);
};

module.exports = { errorHandler, notFound };
