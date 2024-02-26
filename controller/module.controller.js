 const asyncHandler = require("express-async-handler");

const Module = require('../models/module.model');
const { validationResult } = require('express-validator');


const {
    recordNotFound,
  } = require("../utils/response/errors");
const { success } = require("../utils/response/response");




/**
 * @description create new course module
 * @route POST /api/v1/coursemodule
 * @access private [Instructor, Admin]
 */
const createModule = async (req, res) => {
  const { name, videos } = req.body;

  try {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    // Create a new module
    const newModule = new Module({
      name,
      videos,
    });

    // Save the module to the database
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
};
