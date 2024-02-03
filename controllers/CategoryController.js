const CategoryModel = require("../model/Category");
const slugify = require('slugify');
const asyncHandler = require('express-async-handler');


//route POST  /catgory
const createCategory = asyncHandler( async(req,res) =>{
    const name = req.body.name;
    const category = await CategoryModel.create({name , slug : slugify(name) });
     res.status(201).json({ data : category });
});
//route get  /catgory
const getCategories = asyncHandler( async(req,res) =>{
    const categories = await CategoryModel.find({});
     res.status(201).json({result : categories.length , data : categories });
});

//route get  /catgory/:id
const getCategory = asyncHandler( async(req,res) =>{
    const {id} = req.params;
    const category = await CategoryModel.findById(id);
    if(!category){
        res.status(404).json({msg : `No category for this id ${id}`});
    }
     res.status(201).json({ data : category });
});

//route put  /catgory/:id
const updateCategory = asyncHandler( async(req,res) =>{
    const {id} = req.params;
    const {name} = req.body;
    const category = await CategoryModel.findOneAndUpdate(
        {_id : id},
        {name , slug : slugify(name)},
        {new : true}
    );
    if(!category){
        res.status(404).json({msg : `No category for this id ${id}`});
    }
     res.status(201).json({ data : category });
});
//route delete  /catgory/:id
const deleteCategory = asyncHandler( async(req,res) =>{
    const {id} = req.params;

    const category = await CategoryModel.findByIdAndDelete(id);

    if(!category){
        res.status(404).json({msg : `No category for this id ${id}`});
    }
     res.status(201).send();
});
module.exports={createCategory ,getCategories,getCategory,updateCategory,deleteCategory};

// const getCategoryByName = asyncHandler(async (req, res) => {
//     const { name } = req.params;
    
//     // Assuming 'name' is a unique field in your CategoryModel
//     const category = await CategoryModel.findOne({ name });

//     if (!category) {
//         res.status(404).json({ msg: `No category found with the name ${name}` });
//     }

//     res.status(200).json({ data: category });
// });
