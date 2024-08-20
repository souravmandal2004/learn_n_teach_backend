const jwt = require ("jsonwebtoken");
require ("dotenv").config();
const User = require ("../models/user.model.js");

// auth
exports.auth = async (req, res, next) => {
    try {
        // extract jwt token
        const token = req.cookies.token || req.body.token || req.header("Authorisation").replace("Bearer ", "");

        // if token is missing, then return response
        if (!token) {
            return res.status (401). json ({
                success: false,
                message: "Please authenticate to access this route."
            });
        }

        // Verify the token
        try {
            const decode = jwt.verify (token, process.env.JWT_SECRET);
            console.log ("Decoded token: " + decode);
            req.user = decode;
        }
        catch (error) {
            // verification - issue
            return res.status (403).json ({
                success: false,
                message: "Invalid token. Please authenticate again."
            });
        }
        next ();
    }
    catch (error) {
        return res.status (401). json ({
            success: false,
            message: "Error while authenticating. Please try again."
        });
    }
}

// isStudent
exports.isStudent = async (req, res, next) => {
    try {
        if (req.user.accountType !== "Student") {
            return res.status (401).json ({
                success: false,
                message: "You are not authorized to access this route. Please contact an administrator."
            });
        }
        next ();
    }
    catch (error) {
        return res.status (500). json ({
            success: false,
            message: "Error while checking if user is a student. Please try again."
        });
    }
}

// isInstructor

exports.isInstructor = async (req, res, next) => {
    try {
        if (req.user.accountType !== "Instructor") {
            return res.status (401).json ({
                success: false,
                message: "You are not authorized to access this route. Please contact an administrator."
            });
        }
        next ();
    }
    catch (error) {
        return res.status (500). json ({
            success: false,
            message: "Error while checking if user is a instructor. Please try again."
        });
    }
}

// isAdmin

exports.idAdmin = async (req, res, next) => {
    try {
        if (req.user.accountType !== "Admin") {
            return res.status (401).json ({
                success: false,
                message: "You are not authorized to access this route. Please contact an administrator."
            });
        }
        next ();
    }
    catch (error) {
        return res.status (500). json ({
            success: false,
            message: "Error while checking if user is a admin. Please try again."
        });
    }
}