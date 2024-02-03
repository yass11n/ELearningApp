const express = require('express');
const {createCategory, getCategories, getCategory,updateCategory,deleteCategory} =require('../controllers/CategoryController');
const router = express.Router();

router.route('/')
    .post(createCategory)
    .get(getCategories);

router.route('/:id')
    .delete(deleteCategory)
    .get(getCategory)
    .put(updateCategory);

module.exports = router;