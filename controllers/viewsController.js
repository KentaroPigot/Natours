const Tour = require('../models/tourModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const factory = require('../controllers/handlerFactory');

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) Get tour data from our collection
  const tours = await Tour.find();

  if (!tours) {
    next(new AppError('No tours found.', 400));
  }

  // 2) Build template
  // 3) Render that template using tour data from step 1
  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  if (!tour) {
    return next(new AppError('No Tour found.', 404));
  }

  res.status(200).render('tour', {
    title: tour.name,
    tour,
  });
});

exports.getLoginForm = (req, res, next) => {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
};

exports.getAccount = (req, res) => {
  // console.log('Hey');
  res.status(200).render('account', {
    title: 'Your account',
  });
};

exports.getMyTours = catchAsync(async (req, res, next) => {
  // 1) Find all bookings
  const bookings = await Booking.find({ user: req.user.id });

  // 2) Find tours with the returned IDs
  const tourIDs = bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } }); // Va return tous les tours qui ont comme _id l'un de ceux dans (in) tourIDs

  res.status(200).render('overview', {
    title: 'My Tours',
    tours,
  });
});

exports.updateUserData = catchAsync(async (req, res) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(200).render('account', {
    title: 'Your account',
    user: updatedUser,
  });
});
