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
            const token = jwt.sign(
                {
                    "UserInfo": {
                        "email": foundUser.email,
                        "roles": roles
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '1d' }
            );

            res.json({ token });
        } else {
            res.sendStatus(401); // Unauthorized
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ 'message': 'Internal Server Error' });
    }
};
module.exports = { handleLogin };
