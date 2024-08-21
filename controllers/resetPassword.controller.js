const User = require("../models/user.model.js");
const mailSender = require("../utils/mailSender.util.js");
const bcrypt = require("bcrypt");
require("dotenv").config();


// // resetPasswordToken -> function to send the link to the mail
// exports.resetPasswordToken = async (req, res) => {
//     try {

//         // get email from req body
//         const email = req.body;

//         // check user for this email, email validation
//         const user = await User.findOne ({email: email});

//         if (!user) {
//             return res.status (404).json ({
//                 success: false,
//                 message: "User not found with this email."
//             });
//         }

//         // generate token
//         const token = crypto.randomUUID();

//         // update user by adding token and expiration time
//         const updatedDetails = User.findOneAndUpdate ({email: email}, {token: token, resetPasswordExpires: Date.now() + 5*60*1000}, {new: true});

//         // create url
//         const url = `http://localhost:3000/update-password/${token}`;

//         // send mail containing the url
//         await mailSender(email, "Password Reset Link", `Password Reset Link: ${url}`);

//         // return response
//         return res.status(200).json ({
//             success: true,
//             message: "Reset password link sent to your email."
//         });
//     }

//     catch (error) {
//         console.log ("Error while sending the mail to reset password", error.message);
//         return res.status (500).json ({
//             success: false,
//             message: "Error while sending the mail to reset password."
//         });
//     }
// }


// // resetPassword  -> function to actually reset the password
// exports.resetPassword = async (req, res) => {
//     try {
//         // data fetch
//         const {password, confirmPassword, token} = req.body;

//         // validation
//         if (confirmPassword !== password) {
//             return res.status (401).json ({
//                 success: false,
//                 message: "Password and confirmPassword do not match."
//             });
//         }

//         // get userDetails from db using token
//         const userDetails = await User.findOne ({token: token});

//         // if no entry -- invalid token
//         if (!userDetails) {
//             return res.json({
// 				success: false,
// 				message: "Token is Invalid",
// 			});
//         }

//         // check the expiration time of the token
//         if (!(userDetails.resetPasswordExpires > Date.now())) {
// 			return res.status(403).json({
// 				success: false,
// 				message: `Token is Expired, Please Regenerate Your Token`,
// 			});
// 		}

//         // hash the password
//         const encryptedPassword = await bcrypt.hash(password, 10);

//         // update the password
//         await User.findOneAndUpdate(
// 			{ token: token },
// 			{ password: encryptedPassword },
// 			{ new: true }
// 		);

//         // return the response
//         return res.status(200).json ({
//             success: true,
//             message: "Password reset successfully."
//         });

//     }

//     catch (error) {
//         console.log ("Error while resetting the password", error.message);
//         return res.status (500).json ({
//             success: false,
//             message: "Error while resetting the password."
//         });
//     }
// }


exports.resetPasswordToken = async (req, res) => {
    try {
        const email = req.body.email

        const user = await User.findOne({ email: email })
        if (!user) {
            return res.json({
                success: false,
                message: `This Email: ${email} is not Registered With Us Enter a Valid Email `,
            })
        }
        const token = crypto.randomBytes(20).toString("hex")

        const updatedDetails = await User.findOneAndUpdate(
            { email: email },
            {
                token: token,
                resetPasswordExpires: Date.now() + 3600000,
            },
            { new: true }
        )
        console.log("DETAILS", updatedDetails)

        const base_url = process.env.FRONTEND_BASE_URL;
        const url = `${base_url}/update-password/${token}`

        await mailSender(
            email,
            "Password Reset",
            `Your Link for email verification is ${url}. Please click this url to reset your password.`
        )

        res.json({
            success: true,
            message:
                "Email Sent Successfully, Please Check Your Email to Continue Further",
        })
    } catch (error) {
        return res.json({
            error: error.message,
            success: false,
            message: `Some Error in Sending the Reset Message`,
        })
    }
}

exports.resetPassword = async (req, res) => {
    try {
        const { password, confirmPassword, token } = req.body

        if (confirmPassword !== password) {
            return res.json({
                success: false,
                message: "Password and Confirm Password Does not Match",
            })
        }
        const userDetails = await User.findOne({ token: token })
        if (!userDetails) {
            return res.json({
                success: false,
                message: "Token is Invalid",
            })
        }
        if (!(userDetails.resetPasswordExpires > Date.now())) {
            return res.status(403).json({
                success: false,
                message: `Token is Expired, Please Regenerate Your Token`,
            })
        }
        const encryptedPassword = await bcrypt.hash(password, 10)
        await User.findOneAndUpdate(
            { token: token },
            { password: encryptedPassword },
            { new: true }
        )
        res.json({
            success: true,
            message: `Password Reset Successful`,
        })
    } catch (error) {
        return res.json({
            error: error.message,
            success: false,
            message: `Some Error in Updating the Password`,
        })
    }
}
