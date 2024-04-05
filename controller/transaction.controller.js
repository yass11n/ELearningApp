const mongoose = require('mongoose');
const sharp = require("sharp");
const asyncHandler = require("express-async-handler");
// const {getOne, getAll} = require("../services/factory.service");
const {
  recordNotFound,
  validationError,
  failure,
} = require("../utils/response/errors");

const { success } = require("../utils/response/response");
const { v4: uuid } = require("uuid");

const User = require("../models/user.model");
const Course = require("../models/Course.model");
const Section = require("../models/section.model");
const Transaction = require("../models/transaction.model");
const Module = mongoose.model("Module");

const {
  uploadToCloudinary,
  uploadSingle,
} = require("../services/file-upload.service");

//handles uploading paymentReceiptImage
const uploadpaymentReceiptImage = uploadSingle("paymentReceiptImage");

// Import necessary modules and dependencies
const resizepaymentReceiptImage = asyncHandler(async (req, res, next) => {
  try {
    const filename = `transaction-${uuid()}-${Date.now()}.jpeg`;

    if (req.file) {
      if (
        !req.file.mimetype.startsWith("image") &&
        req.file.mimetype !== "application/octet-stream"
      ) {
        return next(
          validationError({ message: "Only image files are allowed" })
        );
      }
      console.log("File uploaded:", req.file.originalname)
      const img = await sharp(req.file.buffer)
        .resize(600, 600)
        .toFormat("jpeg")
        .jpeg({ quality: 95 });

      const data = await uploadToCloudinary(
        await img.toBuffer(),
        filename,
        "transaction"
      );

      // Check if 'data' is defined before accessing 'secure_url'
      if (data && data.secure_url) {
        console.log("Image uploaded successfully:", data.secure_url);
        // Save image into our db
        req.body.paymentReceiptImage = data.secure_url;
      } else {
        console.log("No file uploaded");
        return next(
          validationError({
            message: "Error uploading profile image",
          })
        );
      }
    }
    next();
  } catch (err) {
    next(err);
  }
});
/**
 * @description create a new paymentReceipt transaction
 * @route POST /api/v1/transaction
 * @access private [User]
 */
const createTransaction = asyncHandler(async (req, res, next) => {
  try {
    const { phoneNumber, paymentReceiptImage, courseId, CoursePrice , userId } = req.body;

    // Check for existing approved transactions
    const existingTransaction = await Transaction.findOne({
      userId,
      courseId,
      status: "Approved", // Only consider approved transactions
    });
    console.log(phoneNumber, paymentReceiptImage, courseId, CoursePrice , userId);

    if (existingTransaction) {
      return next(validationError({ message: "You already enrolled this course" }));
    }
    // Check for existing pending transactions
    const existingTransactions = await Transaction.findOne({
      userId,
      courseId,
      status: "Pending", // Only consider pending transactions
    });

    if (existingTransactions) {
      return next(
        validationError({
          message: "You already have a pending transaction for this course.",
        })
      );
    }
    
    // Find the course by ID (assuming courseId is valid)
    const course = await Course.findById(courseId);
    
    // Check if paymentReceiptImage exists (optional)
    if (!paymentReceiptImage) {
      return next(validationError({ message: "Missing payment receipt image URL" }));
    }

    if (!course) {
      return next(recordNotFound({ message: "Course not found" }));
    }
    
    const transaction = await Transaction.create({
      phoneNumber: phoneNumber,
      CoursePrice: CoursePrice,
      courseId: courseId,
      paymentReceiptImage: paymentReceiptImage,
      userId : userId,
      // Set transaction status to "Pending" initially
    });

    // Update the User model to add the transaction ID
    await User.findByIdAndUpdate(userId, {
      $push: { transactions: transaction._id }, // Use transaction ID
    });

     // Update the Course model to add the transaction ID
     await Course.findByIdAndUpdate(courseId, {
      $push: { transactions: transaction._id }, // Use transaction ID
    });

    // Send success response, indicating transaction is pending approval
    const { statusCode, body } = success({
      data: transaction,
      message: "Transaction created successfully. Pending approval.",
    });
    res.status(statusCode).json(body);
  } catch (error) {
    return next(failure({ message: "Error creating transaction" }));
  }
});


/**
 * @description getall paymentReceipt transactions
 * @route get /api/v1/transaction
 * @access private [Admin]
 */
const getAllTransactions = asyncHandler(async (req, res, next) => {
  try {
    const transactions = await Transaction.find(); // Retrieve all transactions

    const formattedTransactions = transactions.map((transaction) => ({
      _id: transaction._id,
      userId: transaction.userId,
      courseId: transaction.courseId,
      coursePrice: transaction.CoursePrice,
      paymentReceiptImage: transaction.paymentReceiptImage || "", // Include image URL if available
    }));
    
    console.log(`paymentReceiptImage`, formattedTransactions);

    // Send success response with formatted data
    const { statusCode, body } = success({ data: formattedTransactions });
    res.status(statusCode).json(body);
  } catch (error) {
    next(failure({ message: "Error retrieving transactions" }));
  }
}); 

/**
 * @description getone paymentReceipt transaction
 * @route get /api/v1/transaction/:id
 * @access private [Admin]
 */
const getOneTransaction = asyncHandler(async (req, res, next) => {
  try {
    const transactionId = req.params.id;
    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      return next(recordNotFound({ message: "Transaction not found" }));
    }

    const formattedTransaction = {
      _id: transaction._id, // Include _id for reference
      userId: transaction.userId,
      courseId: transaction.courseId,
      coursePrice: transaction.CoursePrice,
      paymentReceiptImage: transaction.paymentReceiptImage,
    };

    // Send success response with formatted data
    const { statusCode, body } = success({ data: formattedTransaction });
    res.status(statusCode).json(body);
  } catch (error) {
    next(failure({ message: "Error retrieving transaction" }));
  }
});

/**
 * @description approve a new paymentReceipt transaction 
 * @route POST /api/v1/transaction/approve
 * @access private [Admin]
 */
const approveTransaction = asyncHandler(async (req, res, next) => {
  try {
    // id of transaction process
    const transactionId = req.params.id;

    const transaction = await Transaction.findByIdAndUpdate(
      transactionId,
      { status: "Approved" , enrolled: true },
      { new: true } // Return the updated document
    );

    if (!transaction) {
      return next(recordNotFound({ message: "Transaction not found" }));
    }

    const { userId, courseId } = transaction; // Extract user and course IDs

    // Update the Course model to add the user to enrolledUsers
    await Course.findByIdAndUpdate(courseId, {
      $push: { enrolledUsers: userId },
    });

    // Update the User model to add the course to enrolledCourses
    await User.findByIdAndUpdate(userId, {
      $push: { enrolledCourses: courseId },
    });

    // Update Modules within Sections for the approved course
     const sections = await Section.find({ courseId }); // Find sections for the course
     for (const section of sections) {
      const moduleIds = section.modules;
      for (const moduleId of moduleIds) {
        const module = await Module.findById(moduleId);
        if (module) {
          module.isFree = true;
          try {
            await module.save(); // Await within the loop iteration
          } catch (error) {
            console.error("Error updating module:", error);
            // Handle the error appropriately (e.g., return an error response)
          }
        }
      }
    }

    // Send success response
    const { statusCode, body } = success({ data: transaction });
    res.status(statusCode).json(body);
  } catch (error) {
    return next(failure({ message: "Error approving transaction" + error.message }));
  }
});

/**
 * @description reject a new paymentReceipt transaction 
 * @route POST /api/v1/transaction/reject
 * @access private [Admin]
 */
// Function to reject a transaction
const rejectTransaction = asyncHandler(async (req, res, next) => {
  try {
    const transactionId = req.params.id;
    const { rejectionReason } = req.body; // Optional rejection reason

    const transaction = await Transaction.findByIdAndUpdate(
      transactionId,
      {
        status: "Rejected",
        rejectionReason, // Add rejection reason if provided
      },
      { new: true }
    );

    if (!transaction) {
      return next(recordNotFound({ message: "Transaction not found" }));
    }

    // Send success response
    const { statusCode, body } = success({ data: transaction });
    res.status(statusCode).json(body);
  } catch (error) {
    return next(failure({ message: "Error rejecting transaction" }));
  }
});

module.exports = {
  resizepaymentReceiptImage,
  uploadpaymentReceiptImage,
  createTransaction,
  approveTransaction,
  rejectTransaction,
  getAllTransactions,
  getOneTransaction,
};
