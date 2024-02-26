/**
 * @route /api/v1/course
 */

const { Router } = require("express");
const {
    createCourse,
    getAllCourses,
    deleteCourse,
    updateCourse,
    getCourseById,
    resizethumbnailImg,
    uploadthumbnailImg,
    videotrailer
} = require("../controller/course.controller");

const { protect, allowedRoles } = require("../services/auth.service");

const {
    createCourseValidator,
    deleteCourseValidator,
    getCourseValidator,
    updateCourseValidator,
 } = require("../utils/validations/course.validation"); 

const router = Router();

    // protected
    router.use(protect);

    // private [Instructor]
    router.use(allowedRoles("Instructor", "Admin"));
    
    router.route("/")
    .get(getAllCourses)
    .post(
        uploadthumbnailImg,
        resizethumbnailImg,
        videotrailer,
        createCourseValidator,
        createCourse);
    
    router.route("/:id")
    .get(getCourseValidator , getCourseById)
    .delete(deleteCourseValidator , deleteCourse)
    .put(updateCourseValidator , updateCourse);    
    


module.exports = router;