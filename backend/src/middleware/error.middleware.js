const errorMiddleware = (err, req, res, next) => {
  console.error(err.message);

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    error: err.code || 'SERVER_ERROR',
    message: err.message || 'Something went wrong'
  });
};

module.exports = errorMiddleware;