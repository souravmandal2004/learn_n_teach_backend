const SubSection = require ("../models/subSection.model.js");
const Section = require ("../models/section.model.js");
const Course = require("../models/course.model.js");
const {uploadImageToCloudinary} = require ("../utils/imageUploader.js");


// create subsection
exports.createSubSection = async (req, res) => {
    try {

        // fetch data from req body
        const {sectionId, title, timeDuration, description} = req.body;

        // extract file/video
        const video = req.files.video;

        // validate the data
        if (!sectionId || !title || !timeDuration || !description || !video) {
            return res.status (404). json ({
                success: false,
                message: "Please provide all the required fields."
            });
        }

        // upload video to cloudinary
        const uplaodDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);

        // create subsection
        const subSectionDetails = Subsection.create ({
            title: title,
            timeDuration: timeDuration,
            description: description,
            videoUrl: uplaodDetails.secure_url,
        })

        // push the id of the subsection to section
        const updatedSection = await Section.findByIdAndUpdate(
			{ _id: sectionId },
			{ $push: { subSection: subSectionDetails._id } },
			{ new: true }
		).populate("subSection");

        // return response
        return res.status (200). json ({
            success: true,
            message: "Subsection created successfully.",
            data: updatedSection,
        });
    }

    catch (error) {
        console.log ("Error while creating SubSection", error.message);
        return res.status (500). json ({
            success: false,
            message: "Error while creating SubSection. Please try again.",
        });
    }
}

// UPDATE subSection
exports.updateSubSection = async (req, res) => {
    try {
        // Extract necessary information from the request body
		const { subSectionId, title , description,courseId } = req.body;
		const video = req?.files?.videoFile;

		
		let uploadDetails = null;
		// Upload the video file to Cloudinary
		if(video){
		    uploadDetails = await uploadImageToCloudinary(
			video,
			process.env.FOLDER_NAME
		);
		}

		// Create a new sub-section with the necessary information
		const subSectionDetails = await SubSection.findByIdAndUpdate({_id:subSectionId},{
			title: title || SubSection.title,
			timeDuration: timeDuration,
			description: description || SubSection.description,
			videoUrl: uploadDetails?.secure_url || SubSection.videoUrl,
		},{ new: true });

		
		const updatedCourse = await Course.findById(courseId).populate({ path: "courseContent", populate: { path: "subSection" } }).exec();
		// Return the updated section in the response
		return res.status(200).json({ success: true, data: updatedCourse });
    }

    catch (error) {
       // Handle any errors that may occur during the process
		console.error("Error creating new sub-section:", error);
		return res.status(500).json({
			success: false,
			message: "Error creating new sub-section",
			error: error.message,
		});
    }
}

// DELETE a sub-section
exports.deleteSubSection = async(req, res) => {

	try {
		const {subSectionId,courseId} = req.body;
		const sectionId=req.body.sectionId;
        if(!subSectionId || !sectionId){
            return res.status(404).json({
                success: false,
                message: "All fields are required",
            });
        }
        const ifsubSection = await SubSection.findById({_id:subSectionId});
        const ifsection= await Section.findById({_id:sectionId});
        if(!ifsubSection){
            return res.status(404).json({
                success: false,
                message: "Sub-section not found",
            });
        }
        if(!ifsection){
            return res.status(404).json({
                success: false,
                message: "Section not found",
            });
        }
        await SubSection.findByIdAndDelete(subSectionId);
        await Section.findByIdAndUpdate({_id:sectionId},{$pull:{subSection:subSectionId}},{new:true});
        const updatedCourse = await Course.findById(courseId).populate({ path: "courseContent", populate: { path: "subSection" } }).exec();
        return res.status(200).json({ success: true, message: "Sub-section deleted", data: updatedCourse });
		
	} catch (error) {
		// Handle any errors that may occur during the process
        console.error("Error deleting sub-section:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
	}
};