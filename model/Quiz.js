const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  description: { type: String },
  timeLimit: { type: Number }, // Time limit for completing the quiz in minutes
  attemptsAllowed: { type: Number, default: 1 }, // Number of attempts allowed
  passPercentage: { type: Number }, // Percentage required to pass the quiz
  randomizeQuestions: { type: Boolean, default: false }, // Randomize the order of questions
  randomizeOptions: { type: Boolean, default: false }, // Randomize the order of options within each question
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Quiz creator
  createdAt: { type: Date, default: Date.now },
  // Add other quiz-related fields as needed
});

const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = Quiz;
