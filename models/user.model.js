const mongoose = require('mongoose');

const userSchema = new mongoose.Schema ({
    firstName: {
        type: String,
        required: true,
        trim: true,
    },

    lastName: {
        type: String,
        required: true,
        trim: true,
    },

    email : {
        type: String,
        required: true,
        trim: true,
    },
    
    password: {
        type: String,
        required: true,
    },
    
    accountType: {
        type: String,
        enum: ['Admin', 'Student', 'Instructor' ],
        default: 'Student',
        required: true,
    },

    additionalDetails: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Profile",
        required: true,
    },

    courses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true,
        }  
    ],

    image: {
        type: String,
        required: true,
    },

    courseProgress: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "CourseProgress",
        required: true,
    }],
});

module.exports = mongoose.model ('User', userSchema);