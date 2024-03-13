const asyncHandler = require("express-async-handler");
const {
//   recordNotFound,
//   validationError,
} = require("../utils/response/errors");
const { success } = require("../utils/response/response");
//import createModule from module controller
const { createModule } = require("./module.controller");
const Section = require("../models/section.model");
// const Module = require("../models/Module.model");
const { uploadMix, uploadFilesToCloudinary } = require("../services/file-upload.service")
const Course = require("../models/Course.model")
const factory = require("../services/factory.service")

const uploadModuleVideos = uploadMix([{ name: "file" }])

const uploadVideosToCloud = asyncHandler(async (req, res, next) => {
  if (req.files.file) {
    console.log("yess");
    req.body.file = [];
    const veds = req.files.file
    console.log(veds);
    const uploadPromises = veds.map((v) => {
      console.log("hello", v);
      return uploadFilesToCloudinary(v.buffer, "modules").then((result) => {
        console.log("ioioi");
        console.log(result, v);
        req.body.file.push({ path: result.secure_url, filename: result.public_id });
        console.log("donee");
      });
    });
    await Promise.all(uploadPromises);
    console.log("promises: " + uploadPromises);
  }
  next();
})


/**
 * @description create new section
 * @route POST /api/v1/section
 * @access private [Instructor, Admin]
 */
const createSection = asyncHandler(async (req, res) => {
  //check if there is file sent
  console.log("req.files.file")
  ///console.log(if(req.files.file==undefined));
  if (typeof yourVariable === 'undefined' || req.files.file.length === 0) {
    // create section with no file

    // 1- get the course id
    const CourseId = req.body.courseId;

    // 2- create new section with module IDs and without files
    const newSection = await Section.create({
      courseId: req.body.courseId
    });
    console.log(" section id");
    console.log(newSection._id)

    // 3- get the course 
    const updatedCourse = await Course.findById(
      req.body.courseId,
    );

    // 4- Update the corresponding course.sections[] array by pushing new section IDs
    updatedCourse.sections.push(newSection._id)

    // 5- save course changes
    updatedCourse.save();

    // 6- send response back
    const { statusCode, body } = success({
      message: "New Section created without files",
      data: newSection,
    });
    res.status(statusCode).json(body);
  }
  else {
    // create section with files

    // Assuming the uploaded files are in req.files.file
    // 1- get the uploaded files
    const uploadedFiles = req.files.file;
    console.log(uploadedFiles);

    // 2- Create an array to store module IDs
    const moduleIds = [];

    // const sectionDuration = 0;
    // 3- Iterate through each uploaded file and create module for each 
    for (const file of uploadedFiles) {
      // 4- create and get module back
      const module = await createModule({ buffer: file.buffer });
      console.log("module dur ")
      console.log(module)
      //const moduleDurations = module.duration || 0;

      //console.log("Module Durations:", moduleDurations);

      //sectionDuration = moduleDurations.reduce((totalDuration, module) => totalDuration + (module.duration || 0), 0);

      //      console.log("sectionDuration: " + sectionDuration)
      //console.log(module);

      // 5- push module's id into section.moduleIds[] array
      if (module) {
        moduleIds.push(module._id);
      } else {
        // Handle the case where module creation failed
        console.error(`Failed to create module for file: ${file.originalname}`);
        // Returning a more detailed error message
        return res.status(500).json({ message: `Failed to create module for file: ${file.originalname}` });
      }
    }
    // 6- get the course id
    const CourseId = req.body.courseId;

    // 7- Create new section with the module IDs and files
    const newSection = await Section.create({
      //title: req.body.title,
      modules: moduleIds,
      courseId: req.body.courseId,
      //sectionDuration: sectionDuration
    });

    // 8- get the course 
    const updatedCourse = await Course.findById(
      req.body.courseId,
    );

    // 9- Update the corresponding course.sections[] array by pushing new section IDs
    updatedCourse.sections.push(newSection._id)

    // 10- save course changes
    updatedCourse.save();

    // 11- send response back
    const { statusCode, body } = success({
      message: "New Section created with files",
      data: newSection,
    });
    res.status(statusCode).json(body);
  }

});

/**
* @description get all sections
* @route GET /api/v1/section
* @access private [Instructor, Admin]
*/
const getAllSections = factory.getAll(Section);

/**
* @description get section by id
* @route GET /api/v1/section
* @access private [Instructor, Admin]
*/
const getSectionByid = factory.getOne(Section);

/**
* @description update section
* @route PUT /api/v1/section
* @access private [Instructor, Admin]
*/
const updateSection = asyncHandler(async (req, res) => {
  const sectionId = req.params.id;


  try {

    // Check if files are uploaded
    if (!req.files || !req.files.file || req.files.file.length === 0) {
      // Update section without files
      try {
        // 1- update section by id
        const updatedSection = await Section.findByIdAndUpdate(
          sectionId,
          { title: req.body.title },
          { new: true }
        );
        console.log("title" + req.body.title);
        if (!req.body.title)
          console.log("yess");
        // 2- send response back
        const { statusCode, body } = success({
          message: "Section updated successfully no files",
          data: updatedSection,
        });
        return res.status(statusCode).json(body);
      } catch (error) {
        console.error("Error updating section:", error);
        return res.status(500).json({ message: "Internal Server Error" });
      }
    }

    // Log the entire req.files object for debugging
    console.log("req.files:", req.files);

    // Assuming the uploaded files are in req.files.file
    // 1- get the files
    const uploadedFiles = req.files.file;
    console.log(uploadedFiles);

    // 2- Get the section.module[] array to store new module IDs
    const sec = await Section.findById(sectionId);
    const moduleIds = sec.modules;
    
    console.log(moduleIds)

    // 3- Iterate through each uploaded file
    for (const file of uploadedFiles) {
      const module = await createModule({ buffer: file.buffer });
      console.log(module);
      // 4- push module's id into section.moduleIds[] array
      if (module) {
        moduleIds.push(module._id);
      } else {
        // Handle the case where module creation failed
        console.error(`Failed to create module for file: ${file.originalname}`);
        // Returning a more detailed error message
        return res.status(500).json({ message: `Failed to create module for file: ${file.originalname}` });
      }
    }

    // 5- Update the section with the module IDs and other details


    const updatedSection = await Section.findByIdAndUpdate(
      sectionId,
      {
        title: req.body.title,
        modules: moduleIds,
      },
      { new: true }
    );

    // 6- send response back
    const { statusCode, body } = success({
      message: "Section updated with files successfully",
      data: updatedSection,
    });
    res.status(statusCode).json(body);

  } catch (error) {
    console.error("Error updating section:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});



/**
* @description delete section
* @route DELETE /api/v1/section
* @access private [Instructor, Admin]
*/
const deleteSection = factory.deleteOne(Section);

module.exports = {
  createSection,
  getAllSections,
  getSectionByid,
  updateSection,
  deleteSection,
  uploadModuleVideos,
  uploadVideosToCloud
}