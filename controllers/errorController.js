const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  // console.log(message);
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  console.log(value);
  const message = `Duplicate field value: ${value} Please use another value`;
  return new AppError(message, 400);
};

const handleValidationErrorDb = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const sendErrorDev = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    // RENDERED WEBSITE
    res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: err.message,
    });
  }
};

const sendErrorProd = (err, req, res) => {
  // a) API
  if (req.originalUrl.startsWith('/api')) {
    // a.a) Operationnal error : trusted errors 
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
      // a.b) Programming error. 
    }
    // 1) log error
    console.error('Error', err);

    // 2) Send generic message
    return res
      .status(500)
      .json({ status: 'error', message: 'Something went wrong!' });
  } else {
    // b) rendered website
    // b.a) Operationnal error 
    if (err.isOperational) {
      return res.status(err.statusCode).render('error', {
        title: 'Something went wrong',
        msg: err.message,
      });

      //b.b) Programming error
    }
    // 1) log error
    console.error('Error', err);

    // 2) Send generic message
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: 'Please try again later.',
    });
  }
};

const handleJWTError = () =>
  new AppError('Invalid Token, please log in again!', 401);

const handleTokenExpiredError = () =>
  new AppError('Token Expired, please log in again!', 401);

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  console.log('Process is actually : ' + process.env.NODE_ENV);

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = Object.create(
      Object.getPrototypeOf(err),
      Object.getOwnPropertyDescriptors(err)
    );

    if (error.name === 'CastError') {
      error = handleCastErrorDB(error);
    }
    if (error.code === 11000) {
      error = handleDuplicateFieldsDB(error);
    }
    if (error.name === 'ValidationError') {
      error = handleValidationErrorDb(error);
    }
    if (error.name === 'JsonWebTokenError') {
      error = handleJWTError();
    }
    if (error.name === 'TokenExpiredError') {
      error = handleTokenExpiredError();
    }

    sendErrorProd(error, req, res);
  }
};
