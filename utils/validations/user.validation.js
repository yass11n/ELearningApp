const { body, param } = require("express-validator");
const slugify = require("slugify");
const { v4: uuid } = require("uuid");
const User = require("../../models/user.model");
const validatorMiddleware = require("../../middleware/validatorMiddleware");

exports.createUserValidator = [
  body("name")
    .notEmpty()
    .withMessage("user name is required")
    .isLength({ min: 3 })
    .withMessage("Too short user name")
    .custom((input, { req }) => {
      req.body.slug = `${slugify(input)}-${uuid()}`;
      return true;
    }),
  body("email")
    .notEmpty()
    .withMessage("user email is required")
    .isEmail()
    .withMessage("email must be valid")
    .custom((val) =>
      User.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error("E-mail already in user"));
        }
      })
    ),
  body("password")
    .notEmpty()
    .withMessage("user password is required")
    .isLength({ min: 8 })
    .withMessage("Too short password"),
  body("passwordConfirm")
    .notEmpty()
    .withMessage("confirm password is required")
    .custom((input, { req }) => {
      return req.body.password === input;
    }),
  body("phone")
    .optional()
    .isMobilePhone(["ar-EG"])
    .withMessage("phone number must be from Egypt"),
  body("role")
    .optional()
    .custom((input) => {
      return input === "admin" || input === "instractor" || input === "user";
    })
    .withMessage("role must be admin or instractor or user"),
  body("profileImage").optional(),
  validatorMiddleware,
];

exports.getUserValidator = [
  param("id").isMongoId().withMessage("invalid mongo id"),
  validatorMiddleware,
];

exports.updateUserValidator = [
  body("name")
    .optional()
    .isLength({ min: 3 })
    .withMessage("Too short user name")
    .custom((input, { req }) => {
      req.body.slug = `${slugify(input)}-${uuid()}`;
      return true;
    }),
  body("email")
    .optional()
    .isEmail()
    .withMessage("email must be valid")
    .custom((val) =>
      User.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error("E-mail already in user"));
        }
      })
    ),
  body("phone")
    .optional()
    .isMobilePhone(["ar-EG"])
    .withMessage("phone number must be from Egypt"),
  body("role")
    .optional()
    .custom((input) => {
      return input === "admin" || input === "instractor" || input === "user";
    })
    .withMessage("role must be admin or instractor or user"),
  body("profileImg").optional(),
  validatorMiddleware,
];

exports.updateUserPasswordValidator = [
  param("id").isMongoId().withMessage("invalid mongo id"),
  body("password")
    .notEmpty()
    .withMessage("new password is required")
    .isLength({ min: 8 })
    .withMessage("Too short password"),
  body("passwordConfirm")
    .notEmpty()
    .withMessage("confirm password is required")
    .custom((input, { req }) => {
      return req.body.password === input;
    }),
];

exports.deleteUserValidator = [
  param("id").isMongoId().withMessage("invalid mongo id"),
  validatorMiddleware,
];

exports.updateLoggedUserValidator = [
  body("name")
    .optional()
    .isLength({ min: 3 })
    .withMessage("Too short user name")
    .custom((input, { req }) => {
      req.body.slug = `${slugify(input)}-${uuid()}`;
      return true;
    }),
  body("email")
    .optional()
    .isEmail()
    .withMessage("email must be valid")
    .custom((val) =>
      User.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error("E-mail already in user"));
        }
      })
    ),
  body("phone")
    .optional()
    .isMobilePhone(["ar-EG"])
    .withMessage("phone number must be from Egypt"),
  body("role")
    .optional()
    .custom((input) => {
      return input === "instractor" || input === "user";
    })
    .withMessage("role must be admin or instractor or user"),
  body("profileImg").optional(),
  validatorMiddleware,
];

exports.updateLoggedUserPasswordValidator = [
  body("oldPassword")
    .notEmpty()
    .withMessage("old password is required")
    .isLength({ min: 8 })
    .withMessage("Too short password"),
  body("newPassword")
    .notEmpty()
    .withMessage("new password is required")
    .isLength({ min: 8 })
    .withMessage("Too short password"),
  body("passwordConfirm")
    .notEmpty()
    .withMessage("confirm password is required")
    .custom((input, { req }) => {
      return req.body.password === input;
    }),
];
