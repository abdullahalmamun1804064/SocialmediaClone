const ErrorHandler = require("../utils/errorHandler");

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  if (process.env.NODE_ENV === "DEVELOPMENT") {
    res.status(err.statusCode).json({
      success: false,
      error: err,
      errMessage: err.message,
      stack: err.stack,
    });
  }
  if (process.env.NODE_ENV === "PRODUCTION") {
    let error = { ...err };
    error.message = err.message;
    //Wrong mongo id
    if (err.name === "CastError") {
      const message = `Resoursce not found: ${err.path}`;
      error = new ErrorHandler(message, 404);
    }

    //ValidatorError error
    if (err.name === "ValidationError") {
      const message = Object.values(err.errors).map((value) => value.message);
      error = new ErrorHandler(message, 404);
    }

   
    res.status(err.statusCode).json({
      success: false,
      message: error.message || "Internal server Error",
    });
  }
};
