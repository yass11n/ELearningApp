const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  isCorrect: { type: Boolean, required: true },
  explanation: { type: String }, // Explanation for the option
  multimediaContent: { type: String }, // URL or reference to multimedia content
  metadata: { type: mongoose.Schema.Types.Mixed }, // Additional metadata as needed
  // Add other option-related fields as needed
});

const Option = mongoose.model('Option', optionSchema);

module.exports = Option;
