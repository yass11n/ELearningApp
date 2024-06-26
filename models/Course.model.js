// course.model.js
const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  title: {
    type: String,
    // required: true,
  },
  enrolledUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  subTitle: {
    type: String,
    // required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    //required: true,
  },
  language: {
    type: String,
    //required: true,
  },
  transactions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PurchaseRequest",
    },
  ],
  level: {
    type: String,
    enum: ["beginner", "intermidiate", "advanced", "Proficient"],
  },
  // first page

  thumbnail: {
    type: String, // Assuming the image will be stored as a URL
    //required: true,
  },
  videoTrailer: {
    type: String, // Assuming the video trailer will be stored as a URL
    //required: true,
  },
  courseDescription: {
    type: String,
    //required: true,
  },
  whatWillBeTaught: {
    type: String,
    //required: true,
  },
  targetAudience: {
    type: String,
    // required: true,
  },
  requirements: {
    type: String,
    //required: true,
  },
  // second page

  sections: [{ type: mongoose.Types.ObjectId, ref: "Section" }],

  ratingsAverage: {
    type: Number,
    min: [1, "Rating must be above or equal 1.0"],
    max: [5, "Rating must be below or equal 5.0"],
  },
  ratingsQuantity: {
    type: Number,
    default: 0,
  },
  duration: {
    hours: {
      type: Number,
      default: 0,
    },
    minutes: {
      type: Number,
      default: 0,
    },
    seconds: {
      type: Number,
      default: 0,
    },
  },
  price: {
    amount: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      enum: ["EGP", "USD"], 
      default: "EGP", 
    },
  },
},
{
  timestamps: true,
});

const Course = mongoose.model("Course", courseSchema);

module.exports = Course;
