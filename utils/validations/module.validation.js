const { body, param } = require("express-validator");
const validatorMiddleware = require("../../middleware/validatorMiddleware");

exports.createModuleValidator = [
  body("name")
    .notEmpty()
    .withMessage("Module name is required"),
  body("videos")
    .isArray()
    .withMessage("Videos must be an array")
    .optional(),
  validatorMiddleware,
];

exports.getModuleValidator = [
  param("id").isMongoId().withMessage("Invalid module ID"),
  validatorMiddleware,
];

exports.updateModuleValidator = [
  body("name")
    .optional()
    .notEmpty()
    .withMessage("Module name is required"),
  body("videos")
    .optional()
    .isArray()
    .withMessage("Videos must be an array"),
  validatorMiddleware,
];

exports.deleteModuleValidator = [
  param("id").isMongoId().withMessage("Invalid module ID"),
  validatorMiddleware,
];
