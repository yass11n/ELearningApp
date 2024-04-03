const mongoose = require("mongoose");

const purchaseRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the user model
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course", // Reference to the course model
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    enrolled: {
      type: Boolean,
      default: false,
    },
    CoursePrice: Number,
    paymentReceiptImage: String,
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    // New property for rejection reason
    rejectionReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("PurchaseRequest", purchaseRequestSchema);
