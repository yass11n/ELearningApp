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
    .delete(verifyRoles(ROLES_LIST.Admin), usersController.deleteUser);
router.route('/')
    .put(usersController.updateUser)
    .post(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor), usersController.createNewUser);
router.put('/changepassword',usersController.ChangeUserPassword);

module.exports = router;