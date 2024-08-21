const express = require("express");
const router = express.Router();

const { auth, isInstructor } = require("../middlewares/auth.middleware.js");

// importing the profile controllers
const {
    deleteAccount,
    updateProfile,
    getAllUserDetails,
    updateDisplayPicture,
    getEnrolledCourses,
    instructorDashboard,
} = require("../controllers/profile.controller.js");
const { resetPasswordToken, resetPassword } = require("../controllers/resetPassword.controller.js");


// ********************************************************************************************************
//                                      Profile routes
// ********************************************************************************************************
// Delet User Account
router.delete("/deleteProfile", auth, deleteAccount);
router.put("/updateProfile", auth, updateProfile);
router.get("/getUserDetails", auth, getAllUserDetails);
router.post("/reset-password-token", auth, resetPasswordToken);
router.post("/reset-password", auth, resetPassword);
router.delete ("deleteProfile", auth, deleteAccount);
// Get Enrolled Courses
router.get("/getEnrolledCourses", auth, getEnrolledCourses)
router.put("/updateDisplayPicture", auth, updateDisplayPicture)
router.get("/instructorDashboard", auth, isInstructor, instructorDashboard)

module.exports = router;