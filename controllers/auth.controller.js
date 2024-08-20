const User = require ("../models/user.model.js");
const Profile = require ("../models/profile.model.js");
const OTP = require ("../models/otp.model.js");
const otpGenerator = require ('otp-generator');
const bcrypt = require ('bcrypt');
const jwt = require ("jsonwebtoken");
require ("dotenv").config ();

// sendOTP
exports.sendOTP = async function (req, res) {

    try {
        // fetch email from request body
        const {email} = req.body;

        // check if user already exists
        const checkUserPresent = await User.findOne ({email});

        // if already exists, return response
        if (checkUserPresent) {
            return res.status (401).json ( {
                success: false,
                message: "User already exists with this email."
            });
        };

        // generate a random 6-digit OTP
        var otp = otpGenerator.generate (6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });

        console.log ("OTP generated successfully", otp);

        // make sure the otp is unique
        let result = await OTP.findOne ({otp: otp});

        while (result) {
            otp = otpGenerator.generate (6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            });
            result = await OTP.findOne ({otp: otp});
        };

        const otpPayload = {email, otp};

        // insert the entry into the db
        const otpBody = OTP.create (otpPayload);
        console.log (otpBody);

        // return successfull response
        return res.status (200). json ({
            success: true,
            message: "OTP sent successfully.",
            otp: otp,
        });
    }

    catch (error) {
        console.log ("Error while sending the OTP", error.message);
        return res.status (500).json ({
            success: false,
            message: "Error while sending the OTP."
        });
    }
}

// signup
exports.signUp = async (req, res) => {

    try {
        // fetch the data from request body
        const {firstName, lastName, email, password, confirmPassword, accountType, contactNumber, otp} = req.body; 

        // validate the data
        if (!firstName || !lastName || !email || !password || !confirmPassword || !otp) 
            return res.status (403).json ({
                success: false,
                message: "Please provide all the required fields."
            });

        // match the password and confirmPassword
        if (password !== confirmPassword) 
            return res.status (400). json ({
                success: false,
                message: "Password and confirmPassword do not match."
            });

        // check user already exists or not
        const existingUser = await User.findOne ({email: email});
        if (existingUser)
            return res.status (400).json ({
                success: false,
                message: "User already exists with this email."
            });

        // find most recent otp for the user
        const recentOTP = await OTP.find ({email}). sort ({createdAt:-1}). limit (1);
        console.log ("Recent OTP is: ",recentOTP);

        // validate the otp
        if (recentOTP.length == 0) {
            // OTP not found
            return res.status (401).json ({
                success: false,
                message: "OTP not found. Please try again."
            });
        }
        else if (otp !== recentOTP) {
            // OTP does not match
            return res.status (401).json ({
                success: false,
                message: "Incorrect OTP. Please try again."
            });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash (password, 10);

        // create entry in db

        const profileDetails = await Profile.create ({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber,
        });

        const user = await User.create ({
            firstName, 
            lastName, 
            email, 
            password: hashedPassword, 
            accountType, 
            contactNumber,
            additionalDetails: profileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        });

        // return success message
        return res.status (200).json ({
            success: true,
            message: "User registered successfully.",
            user,
        });
    }

    catch (error) {
        console.log ("Error while signing up the user", error.message);
        return res.status (500). json ({
            success: false,
            message: "Error while signing up the user. Please try again.",
        });
    }
}

// login
exports.login = async (req, res) => {
    try {
        // fetch data from request body
        const {email, password} = req.body;

        // validate the data
        if (!email || !password) {
            return res.status (403).json ({
                success: false,
                message: "Please provide all the required fields."
            });
        }

        // check user exists or not
        const user = await User.findOne ({email: email}).populate ("additionalDetails");

        if (!user) {
            return res.status (401).json ({
                success: false,
                message: "User not found with this email. Please signup first"
            });
        }

        // generate jwt, after matching the password

        if (await bcrypt.compare (password, user.password)) {

            const payload = {
                email: user.email,
                id: user._id,
                accountType: user.accountType,
            };

            const token = jwt.sign (payload, process.env.JWT_SECRET, {
                expiresIn: "2h"
            });

            user.token = token;
            user.password = undefined;

            // create cookie and send response

            const options = {
                expires: new Date (Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true,
            }
            
            res.cookie ("token", token, options).status (200).json ({
                success: true,
                message: "User logged in successfully.",
                user,
                token,
            });
        }

        else {
            return res.status (401).json ({
                success: false,
                message: "Incorrect password. Please try again."
            });
        }
    }
    catch (error) {
        console.log ("Error while loggin in", error);
        return res.status (500).json ({
            success: false,
            message: "Error while logging in. Please try again."
        });
    }
}

// change password
exports.changePassword = async (req, res) => {
	try {
		// Get user data from req.user
		const userDetails = await User.findById(req.user.id);

		// Get old password, new password, and confirm new password from req.body
		const { oldPassword, newPassword, confirmNewPassword } = req.body;

		// Validate old password
		const isPasswordMatch = await bcrypt.compare(
			oldPassword,
			userDetails.password
		);

		if(oldPassword === newPassword){
			return res.status(400).json({
				success: false,
				message: "New Password cannot be same as Old Password",
			});
		}
		
		if (!isPasswordMatch) {
			// If old password does not match, return a 401 (Unauthorized) error
			return res
				.status(401)
				.json({ success: false, message: "The password is incorrect" });
		}

		// Match new password and confirm new password
		if (newPassword !== confirmNewPassword) {
			// If new password and confirm new password do not match, return a 400 (Bad Request) error
			return res.status(400).json({
				success: false,
				message: "The password and confirm password does not match",
			});
		}

		// Update password
		const encryptedPassword = await bcrypt.hash(newPassword, 10);
		const updatedUserDetails = await User.findByIdAndUpdate(
			req.user.id,
			{ password: encryptedPassword },
			{ new: true }
		);

		// Send notification email
		try {
			const emailResponse = await mailSender(
				updatedUserDetails.email,
				"LearnNTeach - Password Updated",
				passwordUpdated(
					updatedUserDetails.email,
					`Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
				)
			);
			console.log("Email sent successfully:", emailResponse.response);
		} catch (error) {
			// If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
			console.error("Error occurred while sending email:", error);
			return res.status(500).json({
				success: false,
				message: "Error occurred while sending email",
				error: error.message,
			});
		}

		// Return success response
		return res
			.status(200)
			.json({ success: true, message: "Password updated successfully" });
	} catch (error) {
		// If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
		console.error("Error occurred while updating password:", error);
		return res.status(500).json({
			success: false,
			message: "Error occurred while updating password",
			error: error.message,
		});
	}
};