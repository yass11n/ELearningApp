const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  options: [{ text: String, isCorrect: Boolean }],
  explanation: { type: String },
  type: { type: String, enum: ['multipleChoice', 'trueFalse', 'shortAnswer', 'essay'], required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
  tags: [{ type: String }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  // Add other question-related fields as needed
});

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;
