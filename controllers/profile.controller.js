const User = require ("../models/user.model.js");
const Profile = require ("../models/profile.model.js");

// update profile
exports.updateProfile = async (req, res) => {
    try {
        // get data and userId
        const { dateOfBirth = "", about = "", contactNumber, gender} = req.body;
        const id = req.user.id;

        // validate data
        if (!contactNumber || !gender || !id)  {   
            return res.status (404). json ({
                success: false,
                message: "Please provide all the required fields."
            });
        }

        // find Profile
        const userDetails = await User.findById (id);
        const profileId = await Profile.findById (userDetails.additionalDetails);
        const profileDetails = await Profile.findById (profileId);

        // upadte Profile
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.contactNumber = contactNumber;
        profileDetails.gender = gender;

        await profileDetails.save();

        // return response
        return res.status (200). json ({
            success: true,
            message: "Profile updated successfully.",
            data: profileDetails,
        });
    }

    catch (error) {
        console.log ("Error while update profile", error.message);

        return res.status (500).json ({
            success: false,
            message: "Error while updating profile. Please try again.",
        });
    }
}

// delete account
exports.deleteAccount = async (req, res) => {
    try {
        // get id
        const id = req.user.id;

        const userDetails = await User.findById({ _id: id });

        // validation
        if (!uderDetails) {
            return res.status (404). json ({
                success: false,
                message: "User not found."
            });
        }

        // delete profile
        await Profile.findByIdAndDelete({ _id: userDetails.additionalDetails });

        // delete user
        await User.findByIdAndDelete({ _id: id });

        // return response
        res.status(200).json({
			success: true,
			message: "User deleted successfully",
		});
    }

    catch (error) {
        console.log ("Error while deleting account", error.message);

        return res.status (500). json ({
            success: false,
            message: "Error while deleting account. Please try again.",
        });
    }
}

// Get all user details
exports.getAllUserDetails = async (req, res) => {
    try {
        // fetch the user id
        const id = req.user.id;

        // find the userDetails through id
		const userDetails = await User.findById(id)
			.populate("additionalDetails")
			.exec();

		console.log(userDetails);

        // return response
		res.status(200).json({
			success: true,
			message: "User Data fetched successfully",
			data: userDetails,
		});
    }

    catch (error) {
        console.log ("Error while getting user details", error.message);

        return res.status (500). json ({
            success: false,
            message: "Error while getting user details. Please try again.",
        });
    }
}