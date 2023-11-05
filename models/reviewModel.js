const mongoose = require('mongoose');
const catchAsync = require('../utils/catchAsync');
const Tour = require('../models/tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      max: [500, 'Your review exceed the maximum length of 50 characters'],
      min: [5, 'Your review should be longer than 10 characters'],
      required: [true, 'Review cannot be empty'],
    },
    rating: {
      type: Number,
      default: 4,
      max: [5, 'Rating should not exceed the maximum of 5'],
      min: [0, 'Rating should not be less than 0'],
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true }); 

reviewSchema.pre(/^find/, function (next) {

  this.populate({ path: 'user', select: 'name photo' });
  next();
});

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.post('save', function () {
  this.constructor.calcAverageRatings(this.tour);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne(); 
  next();
});

reviewSchema.post(/^findOneAnd/, async function (next) {
  await this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;