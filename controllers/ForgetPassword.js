const asyncHandler=require('express-async-handler');
const User=require('../model/User');

exports.forgetPassword = asyncHandler(async (req,res) =>{
    const user= await User.findOne({email : req.body.email});
    if(!user){
        res.status(404).json({msg : `No user for this email ${req.body.email}`});
    }
});
