const { body, param } = require("express-validator");
const Course = require("../../models/Course.model");
const validatorMiddleware = require("../../middleware/validatorMiddleware");

const createCourseValidator = [
  body("title")
    .notEmpty()
    .withMessage("Course title is required")
    .isLength({ min: 3 })
    .withMessage("Too short course title")
    .optional(),
  body("subTitle")
    .notEmpty()
    .withMessage("Course subtitle is required")
    .optional(),
  body("category")
    .notEmpty()
    .withMessage("Category is required")
    .isMongoId()
    .withMessage("Invalid category ID")
    .custom(async (categoryId) => {
      const category = await Course.findById(categoryId);
      if (!category) {
        throw new Error("Category not found");
      }
    })
    .optional(),
  body("language")
    .notEmpty()
    .withMessage("Language is required")
    .optional(),
  body("level")
    .isInt({ min: 0, max: 3 })
    .withMessage("Invalid course level")
    .optional(),
  body("durationHours")
    .isInt({ min: 0 })
    .withMessage("Invalid course duration")
    .optional(),
  body("thumbnail")
    .notEmpty()
    .withMessage("Thumbnail URL is required")
    .isURL()
    .withMessage("Invalid thumbnail URL")
    .optional(),
  body("videoTrailer")
    .notEmpty()
    .withMessage("Video trailer URL is required")
    .isURL()
    .withMessage("Invalid video trailer URL")
    .optional(),
  body("courseDescription")
    .notEmpty()
    .withMessage("Course description is required")
    .optional(),
  body("whatWillBeTaught")
    .notEmpty()
    .withMessage("What will be taught is required")
    .optional(),
  body("targetAudience")
    .notEmpty()
    .withMessage("Target audience is required")
    .optional(),
  body("requirements")
  .notEmpty()
  .withMessage("Requirements is required")
  .optional(),
  body("modules")
    .isArray()
    .withMessage("Modules must be an array of module IDs")
    .optional(),
  validatorMiddleware,
];

const getCourseValidator = [
  param("id").isMongoId().withMessage("Invalid course ID"),
  validatorMiddleware,
];

const updateCourseValidator = [
  body("title")
    .optional()
    .isLength({ min: 3 })
    .withMessage("Too short course title"),
  body("subTitle").optional(),
  body("category")
    .optional()
    .isMongoId()
    .withMessage("Invalid category ID")
    .custom(async (categoryId) => {
      if (categoryId) {
        const category = await Course.findById(categoryId);
        if (!category) {
          throw new Error("Category not found");
        }
      }
    }),
  body("language").optional(),
  body("level")
    .optional()
    .isInt({ min: 0, max: 3 })
    .withMessage("Invalid course level"),
  body("durationHours")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Invalid course duration"),
  body("thumbnail")
    .optional()
    .isURL()
    .withMessage("Invalid thumbnail URL"),
  body("videoTrailer")
    .optional()
    .isURL()
    .withMessage("Invalid video trailer URL"),
  body("courseDescription").optional(),
  body("whatWillBeTaught").optional(),
  body("targetAudience").optional(),
  body("requirements")
    .optional()
    .isArray({ min: 1 })
    .withMessage("At least one requirement is required"),
  body("modules")
    .optional()
    .isArray()
    .withMessage("Modules must be an array of module IDs"),
  validatorMiddleware,
];

const deleteCourseValidator = [
  param("id").isMongoId().withMessage("Invalid course ID"),
  validatorMiddleware,
];
module.exports = {createCourseValidator ,getCourseValidator ,updateCourseValidator, deleteCourseValidator};
