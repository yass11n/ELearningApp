const express = require('express');
const router = express.Router();
const usersController = require('../../controllers/userController');
const ROLES_LIST = require('../../config/roles_list');
const verifyRoles = require('../../middleware/verifyRoles');

//getAllEmployee fn in controller

router.get('/',usersController.getAllUsers);
//(delete) router.delete('/',verifyRoles(ROLES_LIST.Admin),employeesController.deleteEmployee)
router.route('/:id')
    .get(usersController.getUser)
    .put(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor), usersController.updateUser)
    .delete(verifyRoles(ROLES_LIST.Admin), usersController.deleteUser);
router.route('/')
    .post(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor), usersController.createNewUser);



module.exports = router;