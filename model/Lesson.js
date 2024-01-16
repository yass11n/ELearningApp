const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String },
    videoUrl: { type: String },
    order: { type: Number, default: 0 },
    duration: { type: String }, // or use Number to represent duration in minutes
    attachments: [{ type: String }], // File attachments associated with the lesson
    quizzes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' }], // Quizzes associated with the lesson
    // Add other lesson-related fields as needed
  });
  
  const Lesson = mongoose.model('Lesson', lessonSchema);
  
  module.exports = Lesson;
  