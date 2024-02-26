// module.model.js
const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  videos: [{
    name: {
      type: String,
      required: true,
    },
    file: {
      type: String, // Assuming the video file will be stored as a URL
      required: true,
    },
  }],
  // You can add more fields as needed
});

const Module = mongoose.model('Module', moduleSchema);

module.exports = Module;
