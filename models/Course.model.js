// course.model.js
const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  instructor : {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  subTitle: {
    type: String,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  modules: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
  }],
  language: {
    type: String,
    required: true,
  },
  level: {
    type: Number,
    required: true,
  },
  durationHours: {
    type: Number,
    required: true,
  },
  thumbnail: {
    type: String, // Assuming the image will be stored as a URL
    required: true,
  },
  videoTrailer: {
    type: String, // Assuming the video trailer will be stored as a URL
    required: true,
  },
  courseDescription: {
    type: String,
    required: true,
  },
  whatWillBeTaught: {
    type: String,
    required: true,
  },
  targetAudience: {
    type: String,
    required: true,
  },
  requirements: {
    type: String,
    required: true,
  },
  
});

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
