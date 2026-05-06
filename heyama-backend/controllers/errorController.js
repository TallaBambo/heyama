const AppError = require("./../utils/appError");

// Handle invalid database IDs or types
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

// Handle duplicate database fields
const handleDuplicateFieldDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

// Handle Mongoose validation errors
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

// Handle invalid JWT token
const handleJWTError = () =>
  new AppError("Invalid token. Please log in again!", 401);

// Handle expired JWT token
const handleJWTExpiredError = () =>
  new AppError("Your token has expired! Please log in again", 401);

// Send detailed errors in development
const sendErrorDev = (err, req, res) => {
  // A. For API errors, send a structured JSON response
  if (req.originalUrl.startsWith("/api")) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }

  // B. For website errors, send a simple error message
  return res.status(err.statusCode).json({
    status: "error",
    data: err.message,
    title: "Something went wrong!",
    msg: err.message,
  });
};

// Send generic errors in production
const sendErrorProd = (err, req, res) => {
  // A. For API errors, send a structured JSON response
  if (req.originalUrl.startsWith("/api")) {
    // 1. Operational, trusted errors: send a clear message to the client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }

    // 2. Programming or unknown errors: log the error and send a generic message
    console.error("ERROR 💥", err);
    return res.status(500).json({
      status: "error",
      message: "Please try again later.",
    });
  }

  // B. For website errors, send a simple error message
  return res.status(err.statusCode).json({
    status: "error",
    data: err.message,
    title: "Something went wrong!",
    msg: err.message,
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err, name: err.name, message: err.message };

    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldDB(error);
    if (error.name === "ValidationError")
      error = handleValidationErrorDB(error);
    if (error.name === "JsonWebTokenError") error = handleJWTError();
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};
