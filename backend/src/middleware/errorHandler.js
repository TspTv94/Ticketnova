const errorHandler = (err, req, res, next) => {
  console.error('[ERROR]', err.message);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
};

const notFound = (req, res, next) => {
  const err = new Error('Not Found: ' + req.originalUrl);
  err.statusCode = 404;
  next(err);
};

module.exports = { errorHandler, notFound };
