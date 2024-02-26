/**
 * @route /api/v1/coursemodule
 */
const {Router} = require ("express");

const {
    createModule ,
    deleteModule ,
    getAllModules , 
    getModuleById ,
    updateModule 
    } = require("../controller/module.controller");

const { protect, allowedRoles } = require("../services/auth.service");

const {
    createModuleValidator ,
    deleteModuleValidator , 
    getModuleValidator , 
    updateModuleValidator
} = require("../utils/validations/module.validation");

const router = Router();

// protected
router.use(protect);

// private [Instructor]
router.use(allowedRoles("Instructor", "Admin"));

router.route("/")
.get(getAllModules)
.post(createModuleValidator , createModule);

router.route("/:id")
.get(getModuleValidator ,getModuleById)
.delete(deleteModuleValidator , deleteModule)
.put(updateModuleValidator , updateModule);

module.exports = router;