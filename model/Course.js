const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'Instructor', required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  modules: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Module' }],
  // Add other course-related fields as needed
});

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
