// video 23
const mongoose = require('mongoose');

// fn going to export
//This function is responsible for connecting to the MongoDB database.
const connectDB = async () => {
    try{ 
        await mongoose.connect(process.env.DATABASE_URI);
    }catch(err){
        console.error(err);
    }
};
module.exports = connectDB;