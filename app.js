const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express(); 

// Set security http headers
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

// set limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
}); 
app.use('/api', limiter); 

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// development login
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

console.log(process.env.NODE_ENV);

app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: '50kb' })); 
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Data sanitazation against NoSQL query injection
app.use(mongoSanitize()); 

// Data sanitization against XSS
app.use(xss());

app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

app.use(express.static(path.join(__dirname, 'public'))); // Serving static files

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  // console.log(req.cookies);

  next();
});


app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
