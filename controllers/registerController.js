const User = require("../model/User");
const bcrypt = require('bcrypt');

const handleNewUser = async (req, res) => {
    try {
        const { name, email, phoneNumber, status, password, confirmPassword } = req.body;

        // Basic validation
        if (!name || !email || !phoneNumber || !status || !password || !confirmPassword) {
            return res.status(400).json({ 'message': 'All fields are required.' });
        }

        // Check for duplicate emails in the database
        const duplicate = await User.findOne({ email: email }).exec();
        if (duplicate) {
            return res.status(409).json({ 'message': 'Email already exists.' });
        }

        // Encrypt the password
        const hashedPwd = await bcrypt.hash(password, 10);

        // Create and store the new user
        const result = await User.create({
            "username": name,
            "email": email,
            "phone": phoneNumber,
            "roles": status,
            "password": hashedPwd
        });

        console.log(result);

        res.status(201).json({ 'success': `New user ${email} created!` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ 'message': 'Internal Server Error' });
    }
}

module.exports = { handleNewUser };

/*const User = require("../model/User");
const bcrypt = require('bcrypt');

const handleNewUser = async (req, res) => {
    const { email, pwd } = req.body;
    if (!email || !pwd) return res.status(400).json({ 'message': 'email and password are required.' });
    
    // check for duplicate usernames in the db
    const duplicate = await email.findOne({ email : email}).exec();
    if (duplicate) return res.sendStatus(409); //Conflict 
    
    try {
        //encrypt the password
        const hashedPwd = await bcrypt.hash(pwd, 10);

        // create & store the new user
        const result = await User.create({
            "email": email,
             /* "roles": { "User": 2001 }, 
             we dont need it cause we have default as user it will be added automatically
             // object id will added automatically also */
            //"password": hashedPwd
        //});

       // console.log(result);
        
        // we keep that cause that is what we want to send when we create new user
       // res.status(201).json({ 'success': `New user ${email} created!` });
    //} catch (err) {
      //  res.status(500).json({ 'message': err.message });
   // }
//}

//module.exports = { handleNewUser }; */