// Import the required modules
const express = require("express");
const router = express.Router();

// importing the payment controller
const {
    capturePayment,
    verifyPayment,
    sendPaymentSuccessEmail,
} = require("../controllers/payment.controller.js");

const { auth, isInstructor, isStudent, isAdmin } = require("../middlewares/auth.middleware.js");

// creating routes
router.post("/capturePayment", auth, isStudent, capturePayment)
router.post("/verifyPayment", auth, isStudent, verifyPayment)
router.post(
    "/sendPaymentSuccessEmail",
    auth,
    isStudent,
    sendPaymentSuccessEmail
)

module.exports = router;