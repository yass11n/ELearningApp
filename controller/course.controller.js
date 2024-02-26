const asyncHandler = require("express-async-handler");
const sharp = require("sharp");
const { v4: uuid } = require("uuid");

const {
    recordNotFound,
    validationError,
  } = require("../utils/response/errors");
  const { success } = require("../utils/response/response");
const Course = require('../models/Course.model');

const {
    uploadSingle,
    uploadToCloudinary,
  } = require("../services/file-upload.service");

const uploadthumbnailImg = uploadSingle("thumbnail");
const videotrailer = uploadSingle("videoTrailer");

const resizethumbnailImg = asyncHandler(async (req, res, next) => {
  const filename = `user-${uuid()}-${Date.now()}.jpeg`;

  if (req.file) {
    if (!req.file.mimetype.startsWith("image") && req.file.mimetype !==  'application/octet-stream') {
      return next(validationError({ message: "Only image files are allowed" }));
    }

    const img = await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 95 });

    const data = await uploadToCloudinary(
      await img.toBuffer(),
      filename,
      "course"
    );

    // Save image into our db
    req.body.thumbnail = data.secure_url;
  }

  next();
});

/**
 * @description create new course
 * @route POST /api/v1/course
 * @access private [Instructor, Admin]
 */
const createCourse = asyncHandler ( async (req, res) => {

  const newCourse = await Course.create(req.body);
    
  const { statusCode, body } = success({
    message: "new Course created",
    data: newCourse,
  });
  res.status(statusCode).json(body);

});

/**
 * @description get all courses
 * @route GET /api/v1/course
 * @access private [Instructor, Admin]
 */

const getAllCourses = asyncHandler (async (req, res) => {
    
    const courses = await Course.find().populate('category').populate('instructor').populate('modules');
    
  const {body , statusCode } = success({
    data : {results : courses }, });
    res.status(statusCode).json(body);
});

/**
 * @description get course by id
 * @route GET /api/v1/course/:id
 * @access private [Instructor, Admin]
 */
const getCourseById = asyncHandler(async (req, res) => {
  const courseId = req.params.id;

  const course = await Course.findById(courseId).populate('category').populate('instructor').populate('modules');
  
  const {body , statusCode } = success({
    data : {results : course }, });
    res.status(statusCode).json(body);
});

/**
 * @description update course by id
 * @route PUT /api/v1/course/:id
 * @access private [Instructor, Admin]
 */ 
const updateCourse = asyncHandler (async ( req , res , next ) => {
    const courseId = req.params.id;
    const updatedCourseData = req.body;
    try {
      const updatedCourse = await Course.findByIdAndUpdate(courseId, updatedCourseData, { new: true });
      // 3- Check if the course exists
    if (!updatedCourse) {
        return next(
          recordNotFound({
            message: `User with id ${req.params.id} not found`,
          })
        );
      }
      const { statusCode, body } = success({ data: updatedCourseData });
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
const deleteCourse =asyncHandler( async (req, res , next ) => {
  // 1-delete course by id
    const courseId = req.params.id;
    const deletedCourse = await Course.findByIdAndDelete(courseId);
    // 2- check if course exists
    if (!deletedCourse){
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

module.exports = {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
resizethumbnailImg,
uploadthumbnailImg,
videotrailer,
};
