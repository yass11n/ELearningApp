const asyncHandler = require("express-async-handler");
const sharp = require("sharp");
const { v4: uuid } = require("uuid");
const ApiFeatures = require('../services/api-features.service');
const User = require("../models/user.model");
const UserCredential = require("../models/userCredential.model");
const {
  recordNotFound,
  validationError,
  unAuthorized,
} = require("../utils/response/errors");
const { success } = require("../utils/response/response");
const {
  generateAccessToken,
  generateRefreshToken,
  setRefreshTokenCookie,
} = require("../services/auth.service");

const {
  uploadSingle,
  uploadToCloudinary,
  
} = require("../services/file-upload.service");

const { getOne } = require("../services/factory.service");
const UserCredentials = require("../models/userCredential.model");

exports.uploadProfileImage = uploadSingle("profileImage");
//uploadMix([{ name: 'profileImage', maxCount: 1 }]);

exports.resizeProfileImage = asyncHandler(async (req, res, next) => {
  try {
    const filename = `user-${uuid()}-${Date.now()}.jpeg`;

    if (req.file) {
      if (!req.file.mimetype.startsWith("image") && req.file.mimetype !== 'application/octet-stream') {
        return next(validationError({ message: "Only image files are allowed" }));
      }

      const img = await sharp(req.file.buffer)
        .resize(600, 600)
        .toFormat("jpeg")
        .jpeg({ quality: 95 });

      const data = await uploadToCloudinary(
        await img.toBuffer(),
        filename,
        "users"
      );

      // Check if 'data' is defined before accessing 'secure_url'
      if (data && data.secure_url) {
        // Save image into our db
        req.body.profileImage = data.secure_url;
      } else {
        return next(validationError({
          message: "Error uploading profile image"
        }));
      }
    }

    next();
  } catch (err) {
    next(err);
  }
});

/**
 * @description create new user
 * @route POST /api/v1/users
 * @access private [admin]
 */
exports.createUser = asyncHandler(async (req, res) => {
  // 1- create new user
  const user = await User.create(req.body);

  // 2- create user credentials
  await UserCredential.create({
    password: req.body.password,
    provider: "email",
    providerId: req.body.email,
    user: user._id,
  });

  // 3- send response with all users data
  const { statusCode, body } = success({
    message: "new user created",
    data: user,
  });
  res.status(statusCode).json(body);
});

/**
 * @description get all users
 * @route GET /api/v1/users
 * @access private [admin]
 */
exports.getAllUsers = asyncHandler(async (req, res) => {
  // Build query
  const documentsCounts = await User.countDocuments(); // Assuming your model is named 'User'
  const apiFeatures = new ApiFeatures(User.find({}), req.query)
    .paginate(documentsCounts)
    .filter()
    //.search()
    .limitFields()
    .sort();

  // Execute query
  const { mongooseQuery, paginationResult } = apiFeatures;
  let documents = await mongooseQuery;

  // Check if documents have a Cloudinary photo, if not, replace with default
  documents = documents.map(User => {
    if (!User.profileImage) {
      User.profileImage = 'https://res.cloudinary.com/dcjrolufm/image/upload/v1711983058/defaults/rrn916ctapttfi2tsrtj.png';
    }
    return User;
  });

  const { body, statusCode } = success({
    data: { results: documents, paginationResult },
  });
  res.status(statusCode).json(body);
});

/**
 * @description get user by email
 * @route GET /api/v1/users/email/:email
 * @access private [admin]
 */
exports.getUserByEmail = asyncHandler(async (req, res) => {
  // get email
  const Email = req.params.email;
  // get userCred by eamil
  const user = await UserCredential.findOne({ providerId: Email })
    .populate({ path: "user", select: "name profileImage roles" })
  console.log(user)

  const { statusCode, body } = success({
    data: { results: user }
  });
  res.status(statusCode).json(body);
})
/**
 * @description get user by id
 * @route GET /api/v1/users/:id
 * @access private [admin]
 */
exports.getUser = getOne(User);
/**
 * @description (update user by id) profile 
 * @route PUT /api/v1/users/:id
 * @access private [admin]
 */
exports.updateUser = asyncHandler(async (req, res, next) => {
  try {
    // 1- Update userCredentials for provider id and return data after update (new one)
    if (req.body.email) {
      await UserCredentials.findOneAndUpdate(
        { user: req.params.id },
        { providerId: req.body.email },
        { new: true }
      );
    }

    const userId = req.params.id;
    // 2- Fetch the existing user data from the database
    const existingUser = await User.findById(userId);
    console.log("henna")

    // 3- Check if the user exists
    if (!existingUser) {
      return next(
        recordNotFound({
          message: `User with id ${req.params.id} not found`,
        })
      );
    }
    console.log(existingUser);
    console.log(existingUser.profileImage);
    // 4- Construct an update object with only the allowed fields that have different values
    const updateObject = {};
    if (req.body.name !== userId.name) {
      updateObject.name = req.body.name;
    }
    if (req.body.email !== userId.email) {
      updateObject.email = req.body.email;
    }
    if (req.body.bio !== userId.bio) {
      updateObject.bio = req.body.bio;
    }
    if (req.body.phone !== userId.phone) {
      updateObject.phone = req.body.phone;
    }
    if (req.body.gender !== userId.gender) {
      updateObject.gender = req.body.gender;
    }
    console.log(userId.profileImage);
    console.log(req.body.profileImage);
    if (req.body.profileImage !== userId.profileImage) {
      console.log("gowa");
      console.log(userId.profileImage);
      console.log(req.body.profileImage);
      updateObject.profileImage = req.body.profileImage;
    }
    if (req.body.jobTitle !== userId.jobTitle) {
      updateObject.jobTitle = req.body.jobTitle;
    }
    if (req.body.jobDescription !== userId.jobDescription) {
      updateObject.jobDescription = req.body.jobDescription;
    }
    if (req.body.facebookUrl !== userId.facebookUrl) {
      updateObject.facebookUrl = req.body.facebookUrl;
    }
    if (req.body.linkedinUrl !== userId.linkedinUrl) {
      updateObject.linkedinUrl = req.body.linkedinUrl;
    }
    if (req.body.instagramUrl !== userId.instagramUrl) {
      updateObject.instagramUrl = req.body.instagramUrl;
    }

    // 5- Update user by id with the constructed update object
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateObject,
      {
        new: true,
      }
    );

    // 6- Send response with the updated user profile
    const { statusCode, body } = success({ data: updatedUser });
    res.status(statusCode).json(body);
  } catch (error) {
    next(error);
  }
});
/**
 * @description update user password
 * @route PUT /api/v1/users/changePassword/:id
 * @access private [admin]
 */
exports.updateUserPassword = asyncHandler(async (req, res, next) => {
  // 1- update user password and set password changed at to the current date
  const user = await UserCredential.findOneAndUpdate(
    { user: req.params.id },
    {
      password: req.body.password,
      passwordChangedAt: Date.now(),
      tokens: [],
    }
  );

  // 2- check if user exists
  if (!user)
    next(
      recordNotFound({
        message: `user with id ${req.params.id} not found`,
      })
    );

  // 3- send response back
  const { statusCode, body } = success({
    message: "password updated successfully",
  });
  res.status(statusCode).json(body);
});

/**
 * @description delete user by id
 * @route DELETE /api/v1/users/:id
 * @access private [admin]
 */
exports.deleteUser = asyncHandler(async (req, res, next) => {
  // 1- delete user by id
  const user = await User.findByIdAndDelete(req.params.id);

  // 2- check if user exists
  if (!user) {
    next(
      recordNotFound({
        message: `user with id ${req.params.id} not found`,
      })
    );
  }

  // 3- delete user credentials
  await UserCredential.findOneAndDelete({ user: req.params.id });

  // 4- send response back
  const { statusCode, body } = success({
    message: "user deleted successfully",
  });
  res.status(statusCode).json(body);
});

/**
 * @description get logged user data
 * @route GET /api/v1/users/getMe
 * @access protected [user]
 */
exports.getLoggedUser = asyncHandler(async (req, res, next) => {
  // 1- set params.id to logged user id
  req.params.id = req.user._id;

  // 2- go to getUser
  next();
});

/**
 * @description update logged user data
 * @route PUT /api/v1/users/updateMe
 * @access protected [user]
 */
exports.updateLoggedUser = asyncHandler(async (req, res, next) => {
  // 1- set params.id to logged user id
  req.params.id = req.user._id;

  // 2- go to updateUser
  next();
});

/**
 * @description update logged user password
 * @route GET /api/v1/users/changeMyPassword
 * @access protected [user]
 */
exports.updateLoggedUserPassword = asyncHandler(async (req, res, next) => {
  // 1- get logged user
  const user = await UserCredential.findOne({ user: req.user._id });

  // 2- check if old password is correct
  if (!(await user.comparePassword(req.body.oldPassword))) next(unAuthorized());
  console.log("old password: " + req.body.oldPassword + " is true");

  // 3- update user password and password changed at and empty all tokens
  user.password = req.body.newPassword;
  user.passwordChangedAt = Date.now();
  user.tokens = [];

  // 4- generate new access token and refresh token for the user
  const accessToken = generateAccessToken({ userId: req.user._id });
  const refreshToken = generateRefreshToken({ userId: req.user._id });

  // 5- save user with new refresh token
  user.tokens.push(refreshToken);
  await user.save();

  // 6- set refresh token as httpOnly cookie
  setRefreshTokenCookie(res, refreshToken);

  // 7- send access token as response
  const { statusCode, body } = success({
    message: "password updated successfully",
    data: { token: accessToken },
  });
  res.status(statusCode).json(body);
});

/**
 * @description delete logged user data
 * @route GET /api/v1/users/deleteMe
 * @access protected [user]
 */
exports.deleteLoggedUser = asyncHandler(async (req, res) => {

  // 1- set active state to false for user
  await UserCredential.findOneAndUpdate(
    { user: req.user._id },
    {
      active: false,
      tokens: [],
    }
  );

  // 3- send response back
  const { statusCode, body } = success({
    message: "account closed successfully",
  });
  res.status(statusCode).json(body);
});

// exports.updateUser = asyncHandler(async (req, res, next) => {
//   // 1- update userCredentials for provider id and return data after update(new one) 
//   if(req.body.email){
//    await UserCredentials.findOneAndUpdate({ user : req.params.id}, {providerId : req.body.email}, {new : true});
//   }
//   // 2- update user by id
//   const user = await User.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//   });

//   // 3- check if user exists
//   if (!user)
//     next(
//       recordNotFound({
//         message: `user with id ${req.params.id} not found`,
//       })
//     );

//   // 4- send response with new user profile
//   const { statusCode, body } = success({ data: user });
//   res.status(statusCode).json(body); });