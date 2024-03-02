const asyncHandler = require("express-async-handler");

const Module = require('../models/Module.model');
const {uploadMix, uploadFilesToCloudinary} = require("../services/file-upload.service")

const {
    recordNotFound,
  } = require("../utils/response/errors");
const { success } = require("../utils/response/response");


const uploadModuleVideos = uploadMix([{name:"file"}])

const uploadVideosToCloud = asyncHandler(async(req,res,next)=>{

  if(req.files.file){
    req.body.videos =[];
    const veds = req.files.file

    const uploadPromises = veds.map((v) => {
      console.log("hello", v);
      return uploadFilesToCloudinary(v.buffer, "modules").then((result) => {
        console.log("ioioi");
        console.log(result, v);
        req.body.videos.push({file: result.secure_url, filename: result.public_id});
      });
    });
    await Promise.all(uploadPromises);
  }
  next();
})

const createModule = async (req, res) => {
  try {

    console.log(req.body);
    const { name, videos } = req.body;

    const newModule = new Module({ name, videos });
    const savedModule = await newModule.save();
    res.status(200).json(savedModule);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};



/**
 * @description get all coursesmodules
 * @route GET /api/v1/coursemodule
 * @access private [Instructor, Admin]
 */
const getAllModules = asyncHandler( async (req, res) => {

    const modules = await Module.find();

    const {body , statusCode } = success({
        data : {results : modules }, });
        res.status(statusCode).json(body);

});


/**
 * @description get module by id
 * @route GET /api/v1/coursemodule/:id
 * @access private [Instructor, Admin]
 */
const getModuleById = asyncHandler( async (req, res) => {
    
    const moduleId = req.params.id;

    const module = await Module.findById(moduleId);

    // Check if the module exists
    if (!module) {
      return res.status(404).json({ message: `Module with id ${moduleId} not found` });
    }

    const {body , statusCode } = success({
        data : {results : module }, });
        res.status(statusCode).json(body);
});


/**
 * @description update module by id
 * @route PUT /api/v1/coursemodule/:id
 * @access private [Instructor, Admin]
 */ 
const updateModule = asyncHandler (async (req, res) => {
  const moduleId = req.params.id;
  const updatedModuleData = req.body;

  try {
    // Update the module
    const updatedModule = await Module.findByIdAndUpdate(moduleId, updatedModuleData, { new: true });

    // Check if the module exists
    if (!updatedModule) {
      return res.status(404).json({ message: `Module with id ${moduleId} not found` });
    }

    res.status(200).json(updatedModule);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * @description delete module by id
 * @route DELETE /api/v1/coursemodule/:id
 * @access private [Instructor, Admin]
 */
const deleteModule = async (req, res, next) => {
    // Delete the module
    const deletedModule = await Module.findByIdAndDelete(req.params.id);

    // Check if the module exists
    if(!deletedModule){
        next(
            recordNotFound({
              message: `course with id ${req.params.id} not found`,
            })
          );
        }

    //  send response back
        const { statusCode, body } = success({
            message: "course deleted successfully",
          });
          res.status(statusCode).json(body);
};

module.exports = {
  createModule,
  getAllModules,
  getModuleById,
  updateModule,
  deleteModule,
  uploadModuleVideos,
  uploadVideosToCloud
};
