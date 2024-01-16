const User = require("../model/User");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Login
const handleLogin = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ 'message': 'Email and password are required.' });
    }

    try {
        const foundUser = await User.findOne({ email: email }).exec();

        if (!foundUser) {
            return res.sendStatus(401); // Unauthorized
        }

        // Evaluate password
        const match = await bcrypt.compare(password, foundUser.password);

        if (match) {
            const roles = Object.values(foundUser.roles);

            // Create JWTs
            const accessToken = jwt.sign(
                {
                    "UserInfo": {
                        "email": foundUser.email,
                        "roles": roles
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '1d' }
            );

            const refreshToken = jwt.sign(
                { "email": foundUser.email },
                process.env.REFRESH_TOKEN_SECRET,
                { expiresIn: '1d' }
            );

            // Saving refreshToken with the current user
            foundUser.refreshToken = refreshToken;
            const result = await foundUser.save();
            console.log(result);

            res.cookie('jwt', refreshToken, { httpOnly: true, sameSite: 'None', maxAge: 24 * 60 * 60 * 1000 });
            res.json({ accessToken });
        } else {
            res.sendStatus(401); // Unauthorized
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ 'message': 'Internal Server Error' });
    }
};
module.exports = { handleLogin };

// const User = require("../model/User");
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');

// // sign in
// const handleLogin = async (req, res) => {
//     const { user, pwd } = req.body;
//     if (!user || !pwd) return res.status(400).json({ 'message': 'Username and password are required.' });
    
//     const foundUser = await User.findOne({ username : user }).exec();
//     if (!foundUser) return res.sendStatus(401); //Unauthorized 
//     // evaluate password 
//     const match = await bcrypt.compare(pwd, foundUser.password);
//     if (match) {
//         const roles = Object.values(foundUser.roles);
//         // create JWTs
//         const accessToken = jwt.sign(
//             {
//                 "UserInfo": {
//                     "username": foundUser.username,
//                     "roles": roles
//                 }
//             },
//             process.env.ACCESS_TOKEN_SECRET,
//             { expiresIn: '1d' }
//         );
//         const refreshToken = jwt.sign(
//             { "username": foundUser.username },
//             process.env.REFRESH_TOKEN_SECRET,
//             { expiresIn: '1d' }
//         );
//         // Saving refreshToken with current user
//         foundUser.refreshToken = refreshToken;
//         const result= await foundUser.save();
//         console.log(result);

//         res.cookie('jwt', refreshToken, { httpOnly: true , sameSite: 'None',  maxAge: 24 * 60 * 60 * 1000 });
//         res.json({ accessToken });
//     } else {
//         res.sendStatus(401);
//     }
// }

// module.exports = { handleLogin }