function errorHandler(error, req, res, next) {
  const statusCode = error.statusCode || error.status || 500;
  const payload = {
    success: false,
    message: error.message || 'Server error',
  };

  if (process.env.NODE_ENV !== 'production') {
    payload.stack = error.stack;
  }

  res.status(statusCode).json(payload);
}

module.exports = errorHandler;
