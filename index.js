require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const { logger } = require('./middleware/logEvents');
const errorHandler = require('./middleware/errorHandler');
const verifyJWT = require('./middleware/verifyJWT');
const mongoose = require("mongoose");
const connectDB = require("./config/dbConn"); // محتاج استعدي الداتا بيز اللي استخدمتهاوعملت كونكت ليها قي الكونفج
const { log } = require('console');
const PORT = process.env.PORT || 3500;

//connect to mongoDB
connectDB(); // هستعدي الفانكشن ديه عشان استخدم الداتا بيز here its ready to connect

// custom middleware logger
app.use(logger);

// Handle options credentials check - before CORS!
// and fetch cookies credentials requirement
// app.use(credentials);

// Cross Origin Resource Sharing
app.use(cors());

// built-in middleware to handle urlencoded form data
app.use(express.urlencoded({ extended: false }));

// built-in middleware for json 
app.use(express.json());

//serve static files
//app.use('/', express.static(path.join(__dirname, '/public')));

// routes  to use routes in routers we use (app.use)
//app.use('/', require('./routes/root'));
app.use('/register', require('./routes/register'));
app.use('/auth', require('./routes/auth'));
app.use('/users', require('./routes/api/user'));
app.get('/' ,(req,res)=> res.send("fuck off"))

app.all('/*', (req, res) => {
    res.status(404);
});

app.use(errorHandler);

mongoose.connection.once('open',() => {
    console.log('connect to mongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
