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

            res.status(200).json({ 'success': `New user ${email} created!` });
        } catch (err) {
            console.error(err);
            res.status(500).json({ 'message': 'Internal Server Error' });
        }
    }

module.exports = { handleNewUser };