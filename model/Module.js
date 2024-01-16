const mongoose = require('mongoose');
const moduleSchema = new mongoose.Schema({
    title: { type: String, required: true },
    lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
    description: { type: String },
    order: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
    visibilityDate: { type: Date },
    assignments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Assignment' }],
    passingGrade: { type: Number },
    discussionForum: { type: mongoose.Schema.Types.ObjectId, ref: 'DiscussionForum' },
    interactiveQuizzes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'InteractiveQuiz' }],
    mediaContent: { type: String },
    additionalResources: [{ type: String }],
    completionCriteria: { type: String },
    progressTracking: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    prerequisites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Module' }],
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    tags: [{ type: String }],
    version: { type: String },
  });
  
  const Module = mongoose.model('Module', moduleSchema);
  
  module.exports = Module;
  