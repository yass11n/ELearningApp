const mongoose = require('mongoose');
const { stringify } = require('uuid');
const Schema = mongoose.Schema; // we will need both of them in every schema we will make

const userSchema = new Schema({
    username: 
    { 
        type: String,
        required: true
    },
    email: { type: String, 
    required: true,
    unique: true 
    },
    password:
    { 
        type: String,
        required: true ,
        minlength : [6,"Too Short Password"]
    },
  // Additional Information
  roles: {
    User: {
        type : Number,
        default:2001
    },
    Instructor : Number,
    Admin: Number,
  },
  resetToken: String,
  resetTokenExpiration: Date,
  profileImage: { 
    type:String,
   }, // URL to the user's profile image
  bio: { type: String }, // User's biography or description
  dateOfBirth: { type: Date },
  phone: { type: String },

  // Course-related Information
  enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  completedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],

  // Security
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },

  // Social Media
  socialMedia: {
    twitter: { type: String },
    linkedin: { type: String },
    facebook: { type: String },
    // Add more social media fields as needed
  },
  active:{
    type:Boolean,
    default :true,
  },
},{
  timestamps: true
});
module.exports = mongoose.model('User',userSchema); // create mode and export it at same time
// these two are equivalent
/*const User = mongoose.model('User',userSchema);
module.exports=User;*/