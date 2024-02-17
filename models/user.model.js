const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      minLength: 3,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    bio: String,
    phone: String,
    profileImage: String,
    gender: {
      type: String,
      enum: ["Male", "Female"],
    },
    roles: {
      type: String,
      enum: ["Instructor", "User"],
      default: "User",
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
