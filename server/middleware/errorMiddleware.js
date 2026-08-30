/** Any request that matched no route lands here. */
export const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

/**
 * Central error handler. Every response leaves the API in the same shape:
 * { success: false, message: "..." }
 *
 * Stack traces are logged on the server and only included in the response
 * outside production.
 */
export const errorHandler = (err, req, res, _next) => {
  console.error(err);

  let statusCode = err.statusCode || 500;
  let message = err.message || "Something went wrong";

  // Mongoose validation errors -> 400 with the first readable message
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)[0]?.message || "Invalid input";
  }

  // Duplicate key (the unique index on email)
  if (err.code === 11000) {
    statusCode = 409;
    message = "That email is already registered";
  }

  // Malformed ObjectId
  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid identifier";
  }

  if (statusCode === 500 && process.env.NODE_ENV === "production") {
    message = "Something went wrong";
  }

  const body = { success: false, message };

  if (process.env.NODE_ENV !== "production" && err.stack) {
    body.stack = err.stack;
  }

  res.status(statusCode).json(body);
};
