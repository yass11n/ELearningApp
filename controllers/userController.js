//  for example User  اتعملت بالطريقه ديه عشان هيبقي عندي اكتر من فانكشن فا لازم نعملهم اكسبورت
const User =require("../model/User");
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
}
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
        password: req.body.password
    });
    res.status(200).json(result);// success creation is done fulfilled
   }catch(err){
        console.log(err);
   }

}


//@desc update specific user with id 
//router bta3ha (put) in routes(api)
const updateUser =  async (req, res) => {
    //req.params.id this mean we get id
    // we could get it like const id = req.params instead
    if(!req?.body?.id){
        return res.status(400).json({'message' : 'ID parameter is required '});
    }
    const user = await User.findOne({__id : req.body.id}).exec();
    if (!user) {
        return res.status(200).json({ "message": ` No user matches ID ${req.body.id}` });
    }
    // update data first name , last name
    if (req.body?.username) user.username = req.body.username;
   // if (req.body?.lastname) user.lastname = req.body.lastname;
    const result = await user.save();
    res.json(result);
}

// @desc delete user with specific id
// its route is delete
const deleteUser = async (req, res) => {
    if(!req?.body?.id){
        return res.status(400).json({'message' : 'User ID required '});
    }
    const user = await User.findOne({__id : req.body.id}).exec();
    if (!user) {
        return res.status(200).json({ "message": ` No user matches ID ${req.body.id}` });
    }
    const result = await user.deleteOne({ __id : req.body.id});
    res.json(result);
}

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
    
}

module.exports = {
    createNewUser,
    updateUser,
    deleteUser,
    getUser,
    getAllUsers
}