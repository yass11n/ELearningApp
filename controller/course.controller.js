const asyncHandler = require("express-async-handler");
const sharp = require("sharp");
const { v4: uuid } = require("uuid");
// const factory = require("../services/factory.service")
const {
  recordNotFound,
  validationError,
} = require("../utils/response/errors");
const { success } = require("../utils/response/response");
const Course = require('../models/Course.model');
const Category = require('../models/Category.model'); // Import your Category model

const {
  // uploadSingle,
  uploadToCloudinary,
  uploadMix,
} = require("../services/file-upload.service");
const User = require("../models/user.model");

//handles uploading thumbnail and vedioTrailer
const uploadtBoth = uploadMix([{ name: 'thumbnail', maxCount: 1 }, { name: 'videoTrailer', maxCount: 1 }]);

// Import necessary modules and dependencies
const resizethumbnailImg = asyncHandler(async (req, res, next) => {
  try {
    // Generate a unique filename using UUID and current timestamp
    const filename = `user-${uuid()}-${Date.now()}.jpeg`;

    // Check if a thumbnail file is provided in the request
    if (req.files.thumbnail) {

      // Validate the mimetype of the thumbnail file
      if (!req.files.thumbnail[0].mimetype.startsWith("image") && req.files.thumbnail[0].mimetype !== 'application/octet-stream') {
        return next(validationError({ message: "Only image files are allowed" }));
      }

      // Resize and format the thumbnail image using sharp library
      const img = await sharp(req.files.thumbnail[0].buffer)
        .resize(600, 600)
        .toFormat("jpeg")
        .jpeg({ quality: 95 });

      // Upload the resized thumbnail image to Cloudinary
      const data = await uploadToCloudinary(
        await img.toBuffer(),
        filename,
        "course"
      );
      // Check if 'data' is defined before accessing 'secure_url'
      if (data && data.secure_url) {
        // Save the Cloudinary URL of the thumbnail image into the request body
        req.body.thumbnail = data.secure_url;
      } else {
        return next(validationError({ message: "Error uploading thumbnail image" }));
      }
    }

    // Check if a video trailer file is provided in the request
    if (req.files.videoTrailer) {
      // Upload the video trailer file to Cloudinary
      const data = await uploadToCloudinary(
        req.files.videoTrailer[0].buffer,
        filename,
        "course"
      );

      console.log("Uploaded video trailer data:", data);

      // Check if 'data' is defined before accessing 'secure_url'
      if (data && data.secure_url) {
        // Save the Cloudinary URL of the video trailer into the request body
        req.body.videoTrailer = data.secure_url;
      } else {
        return next(validationError({ message: "Error uploading video trailer" }));
      }
    }

    // Continue to the next middleware or route handler
    next();
  } catch (error) {
    // Pass any errors to the next middleware for error handling
    next(error);
  }
});


/**
 * @description create new course
 * @route POST /api/v1/course
 * @access private [Instructor, Admin]
 */
const createCourse = asyncHandler(async (req, res, next) => {
  try {
    // 1- Extract required fields from the request body
    const { title, subTitle, category, language, level, instructor } = req.body;
    
    // 2- Create the course using the extracted fields
    const newCourse = await Course.create({
      title,
      subTitle,
      category,
      language,
      level,
      instructor,
    });

    // 3- Update the category with the new course
    const updatedCategory = await Category.findByIdAndUpdate(
      category,
      { $push: { courses: newCourse._id } },
      { new: true }
    );

    // 4- Check if the instructor is an 'Instructor' and update the courses
    const instructorRole = await User.findById(instructor, 'roles');

    if (instructorRole.roles === 'Instructor') {
      const updatedInstructor = await User.findByIdAndUpdate(
        instructor,
        { $push: { courses: { _id: newCourse._id, visible: true } } },
        { new: true }
      );
    }

    // 5- Send success response
    const { statusCode, body } = success({ data: newCourse });
    res.status(statusCode).json(body);
  } catch (error) {
    next(error);
  }
});


/**
 * @description get all courses
 * @route GET /api/v1/course
 * @access private [Instructor, Admin]
 */
const getAllCourses = asyncHandler(async (req, res) => {

  const courses = await Course.find().populate('category').populate('instructor').populate('sections');

  const { body, statusCode } = success({
    data: { results: courses },
  });
  res.status(statusCode).json(body);
});

//waiting...
/**kl
 * @description get course by id
 * @route GET /api/v1/course/:id
 * @access private [Instructor, Admin]
 */
const getCourseById = asyncHandler(async (req, res) => {
  const courseId = req.params.id;

  const course = await Course.findById(courseId).populate('category').populate('instructor').populate('sections');

  const { body, statusCode } = success({
    data: { results: course },
  });
  res.status(statusCode).json(body);
});

/**
 * @description update course by id
 * @route PUT /api/v1/course/:id
 * @access private [Instructor, Admin]
 */
const updateCourse = asyncHandler(async (req, res, next) => {  
  const courseId = req.params.id;
  try {
    // 1- Check if the course exists
    if (!courseId) {
      return next(
        recordNotFound({
          message: `course with id ${req.params.id} not found`,
        })
      );
    }

    //2- Construct an update object with only the allowed parameters
    const updatedCourseData = {};

    if (req.body.instructor !== courseId.instructor) {
      updatedCourseData.instructor = req.body.instructor;
    }
    if (req.body.title !== courseId.title) {
      updatedCourseData.title = req.body.title;
    }
    if (req.body.subTitle !== courseId.subTitle) {
      updatedCourseData.subTitle = req.body.subTitle;
    }
    if (req.body.category !== courseId.category) {
      updatedCourseData.category = req.body.category;
    }
    if (req.body.language !== courseId.language) {
      updatedCourseData.language = req.body.language;
    }
    if (req.body.level !== courseId.level) {
      updatedCourseData.level = req.body.level;
    }
    if (req.body.thumbnail !== courseId.thumbnail) {
      updatedCourseData.thumbnail = req.body.thumbnail;
    }
    if (req.body.videoTrailer !== courseId.videoTrailer) {
      updatedCourseData.videoTrailer = req.body.videoTrailer;
    }
    //won't be using it first time when creating new course
    if (req.body.sections !== courseId.sections) {
      updatedCourseData.sections = req.body.sections;
    }
    if (req.body.courseDescription !== courseId.courseDescription) {
      updatedCourseData.courseDescription = req.body.courseDescription;
    }
    if (req.body.whatWillBeTaught !== courseId.whatWillBeTaught) {
      updatedCourseData.whatWillBeTaught = req.body.whatWillBeTaught;
    }
    if (req.body.targetAudience !== courseId.targetAudience) {
      updatedCourseData.targetAudience = req.body.targetAudience;
    }
    if (req.body.requirements !== courseId.requirements) {
      updatedCourseData.requirements = req.body.requirements;
    }
    //3- Update course by id with the constructed update object
    const updatedData = await Course.findByIdAndUpdate(courseId, updatedCourseData, { new: true });

    //4- send a response
    const { statusCode, body } = success({ data: updatedData });
    res.status(statusCode).json(body);
  } catch (error) {
    next(error);
  }
});

/**
 * @description delete course by id
 * @route DELETE /api/v1/course/:id
 * @access private [Instructor, Admin]
 */
const deleteCourse = asyncHandler(async (req, res, next) => {
  // 1-delete course by id
  const courseId = req.params.id;
  const deletedCourse = await Course.findByIdAndDelete(courseId);
  // 2- check if course exists
  if (!deletedCourse) {
    next(
      recordNotFound({
        message: `course with id ${req.params.id} not found`,
      })
    );
  }
  // 3- send response back
  const { statusCode, body } = success({
    message: "course deleted successfully",
  });
  res.status(statusCode).json(body);
});

// @desc    Add course to wishlist
// @route   PUT /api/v1/course/wishlist
// @access  Protected/User
const addCourseToWishlist = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { courseId } = req.body;

  const user = await User.findById(_id);
  const alreadyAdded = user.wishlist.find((id) => id.toString() === courseId);

  if (alreadyAdded) {
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      { $pull: { wishlist: courseId } },
      { new: true }
    );

    const { statusCode, body } = success({
      message: 'Course removed successfully from your wishlist.',
      data: updatedUser.wishlist,
    });
    res.status(statusCode).json(body);
  } else {
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      { $push: { wishlist: courseId } },
      { new: true }
    );

    const { statusCode, body } = success({
      message: 'Course added successfully to your wishlist.',
      data: updatedUser.wishlist,
    });
    res.status(statusCode).json(body);
  }
});

// @desc    getuserwishlist
// @route   GET /api/v1/course/wishlist
// @access  Protected/User
const getLoggedUserWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist');
  
  const { statusCode, body } = success({
    message: 'User Wishlist:',
    results : user.wishlist.length,
    data: user.wishlist
  });
  res.status(statusCode).json(body);
});

// @desc    get all courses to specific category
// @route   GET /api/v1/course/categoriesId/:categoryId
// @access  Protected/User
const getCoursesInCategory = asyncHandler(async (req, res) => {
  const categoryId = req.params.categoryId;

  // Find the category by ID and populate the 'courses' field to get course details
  const categoryWithCourses = await Category.findById(categoryId).populate('courses');

  if (!categoryWithCourses) {
    res.status(404).json({ message: 'Category not found' });
    return;
  }

  // Extract courses from the populated field
  const coursesInCategory = categoryWithCourses.courses;

  const { statusCode, body } = success({
    message: 'categoryCourses:',
    data: coursesInCategory
  });
  res.status(statusCode).json(body);
});

// @desc    get courses to specific instructor
// @route   GET /api/v1/course/getinstructorcourse
// @access  Protected/User
const getCoursesByInstructor = asyncHandler(async (req, res) => {
    // Assuming that the _id of the instructor is stored in req.user._id
    const instructorId = req.user._id;

    // Find courses where the instructor field matches the instructorId
    const courses = await Course.find({ instructor: instructorId });

    if (!courses || courses.length === 0) {
      return res.status(404).json({ message: 'No courses found for this instructor' });
    }
    const { statusCode, body } = success({
      message: 'categoryCourses:',
      data: courses
    });
    res.status(statusCode).json(body);  
});

module.exports = {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  resizethumbnailImg,
  uploadtBoth,
addCourseToWishlist,
getLoggedUserWishlist,
getCoursesInCategory,
getCoursesByInstructor
};
