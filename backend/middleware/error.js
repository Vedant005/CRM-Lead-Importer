export const errorHandler = (err, req, res, next) => {
  console.error("Global Error Handler:", err.stack || err.message || err);

  const statusCode = err.status || err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "An unexpected internal server error occurred",
    ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {}),
  });
};
