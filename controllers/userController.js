//  for example User  اتعملت بالطريقه ديه عشان هيبقي عندي اكتر من فانكشن فا لازم نعملهم اكسبورت
const User =require("../model/User");
const bcrypt = require('bcrypt');
/*Controllers are responsible for handling incoming requests, processing the input, and returning an appropriate response.
 They act as an intermediary between the incoming HTTP requests and the business logic of the application. 
In a typical MVC (Model-View-Controller) architecture, controllers handle the interaction between the model (data) and the view (presentation).*/
// use async await in CRUD operation (c create r read u update d delete) 

// @desc get all employee
// route is get (get all users)
const getAllUsers = async (req, res) => {
    const users = await User.find();//find() say find everything not something in particular
    console.log(users);
    if(!users) return req.status(200).json({'message': 'No users found'});
    res.json(users);
};
//handler dah his job is to create new employee and add it to database
// @desc add new user
// route post
const createNewUser = async (req, res) => {
//    if(!req.body.firstname || !req?.body?.lastname){
//     return res.status(400).json({'message' : 'First and last names are required '});
//    }
   try{
    const result = await User.create({
        username : req.body.name,
        email : req.body.email,
        password: await bcrypt.hash(req.body.password, 10)
    });
    res.status(200).json(result);// success creation is done fulfilled
   }catch(err){
        console.log(err);
   }

};
//@desc update specific user with id 
//router bta3ha (put) in routes(api)
// const updateUser =  async (req, res) => {
//     //req.params.id this mean we get id
//     // we could get it like const id = req.params instead
//     if(!req?.body?.id){
//         return res.status(400).json({'message' : 'ID parameter is required '});
//     }
//     const user = await User.findOne({__id : req.body.id}).exec();
//     if (!user) {
//         return res.status(200).json({ "message": ` No user matches ID ${req.body.id}` });
//     }
//     // update data first name , last name
//     if (req.body?.username) user.username = req.body.username;
//    // if (req.body?.lastname) user.lastname = req.body.lastname;
//     const result = await user.save();
//     res.json(result);
// }

// @desc delete user with specific id
// its route is delete
const updateUser = async (req, res) => {
    try {
        // req.params.id means we get the id from the URL params
        // we could get it like const id = req.params instead
        if (!req?.body?.id) {
            return res.status(400).json({ 'message': 'ID parameter is required.' });
        }

        const user = await User.findOne({ _id: req.body.id }).exec();
        if (!user) {
            return res.status(404).json({ "message": `No user found with ID ${req.body.id}` });
        }
        // Update user data
        if (req.body?.name) user.username = req.body.name;
        // Check if there's a new password and hash it
        // if (req.body?.password) {
        //     const hashedPwd = await bcrypt.hash(req.body.password, 10);
        //     user.password = hashedPwd;
        //}
        // Save the updated user
        if (req.body?.email) user.email = req.body.email;
        if (req.body?.phoneNumber) user.phone = req.body.phoneNumber;
        const result = await user.save();
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ 'message': 'Internal Server Error' });
    }
};
module.exports = { updateUser };
const ChangeUserPassword = async (req, res) => {
    try {
        // req.params.id means we get the id from the URL params
        // we could get it like const id = req.params instead
        if (!req?.body?.id) {
            return res.status(400).json({ 'message': 'ID parameter is required.' });
        }

        const { currentPassword, newPassword, confirmNewPassword } = req.body;

        if (!currentPassword || !newPassword || !confirmNewPassword) {
            return res.status(400).json({ 'message': 'Current password, new password, and confirm new password are required.' });
        }

        const user = await User.findOne({ _id: req.body.id }).exec();

        if (!user) {
            return res.status(404).json({ "message": `No user found with ID ${req.body.id}`});
        }
        // Check if the current password matches the existing password in the database
        const isPasswordMatch = await bcrypt.compare(currentPassword, user.password);

        if (!isPasswordMatch) {
            return res.status(400).json({ 'message': 'Current password does not match.' });
        }

        // Check if the new password matches the confirm new password
        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({ 'message': 'New password and confirm new password do not match.' });
        }

        // Update user password
        user.password = await bcrypt.hash(newPassword, 10);

        const result = await user.save();
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ 'message': 'Internal Server Error' });
    }
};
module.exports={ChangeUserPassword};

const deleteUser = async (req, res) => {
    if(!req?.body?.id){
        return res.status(400).json({'message' : 'User ID required '});
    }
    const user = await User.findOne({_id : req.body.id}).exec();
    if (!user) {
        return res.status(200).json({ "message": ` No user matches ID ${req.body.id}` });
    }
    const result = await user.deleteOne({ __id : req.body.id});
    res.json(result);
};
//@desc get specific user with id 
//router bta3ha get in routes(api)
const getUser = async (req, res) => {
    //req.params.id this mean we get id
    // we could get it like const id = req.params instead
    console.log(req.params.id);
        if(!req?.params?.id){
        return res.status(400).json({'message' : 'User ID required '});
    }
    const user = await User.findById(req.params.id);
    console.log(user);
    if (!user) {
        return res.status(200).json({ "message": ` No employee matches ID ${req.params.id}` });
    }
    res.status(200).json(user);
    
};

module.exports = {
    createNewUser,
    updateUser,
    deleteUser,
    getUser,
    getAllUsers,
    ChangeUserPassword
};