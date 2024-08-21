const SubSection = require("../models/subSection.model.js");
const Section = require("../models/section.model.js");
const Course = require("../models/course.model.js");
const { uploadImageToCloudinary } = require("../utils/imageUploader.js");


// // create subsection
// exports.createSubSection = async (req, res) => {
//     try {

//         // fetch data from req body
//         const {sectionId, title, timeDuration, description} = req.body;

//         // extract file/video
//         const video = req.files.video;

//         // validate the data
//         if (!sectionId || !title || !timeDuration || !description || !video) {
//             return res.status (404). json ({
//                 success: false,
//                 message: "Please provide all the required fields."
//             });
//         }

//         // upload video to cloudinary
//         const uplaodDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);

//         // create subsection
//         const subSectionDetails = Subsection.create ({
//             title: title,
//             timeDuration: timeDuration,
//             description: description,
//             videoUrl: uplaodDetails.secure_url,
//         })

//         // push the id of the subsection to section
//         const updatedSection = await Section.findByIdAndUpdate(
// 			{ _id: sectionId },
// 			{ $push: { subSection: subSectionDetails._id } },
// 			{ new: true }
// 		).populate("subSection");

//         // return response
//         return res.status (200). json ({
//             success: true,
//             message: "Subsection created successfully.",
//             data: updatedSection,
//         });
//     }

//     catch (error) {
//         console.log ("Error while creating SubSection", error.message);
//         return res.status (500). json ({
//             success: false,
//             message: "Error while creating SubSection. Please try again.",
//         });
//     }
// }

// // UPDATE subSection
// exports.updateSubSection = async (req, res) => {
//     try {
//         // Extract necessary information from the request body
// 		const { subSectionId, title , description,courseId } = req.body;
// 		const video = req?.files?.videoFile;


// 		let uploadDetails = null;
// 		// Upload the video file to Cloudinary
// 		if(video){
// 		    uploadDetails = await uploadImageToCloudinary(
// 			video,
// 			process.env.FOLDER_NAME
// 		);
// 		}

// 		// Create a new sub-section with the necessary information
// 		const subSectionDetails = await SubSection.findByIdAndUpdate({_id:subSectionId},{
// 			title: title || SubSection.title,
// 			timeDuration: timeDuration,
// 			description: description || SubSection.description,
// 			videoUrl: uploadDetails?.secure_url || SubSection.videoUrl,
// 		},{ new: true });


// 		const updatedCourse = await Course.findById(courseId).populate({ path: "courseContent", populate: { path: "subSection" } }).exec();
// 		// Return the updated section in the response
// 		return res.status(200).json({ success: true, data: updatedCourse });
//     }

//     catch (error) {
//        // Handle any errors that may occur during the process
// 		console.error("Error creating new sub-section:", error);
// 		return res.status(500).json({
// 			success: false,
// 			message: "Error creating new sub-section",
// 			error: error.message,
// 		});
//     }
// }

// // DELETE a sub-section
// exports.deleteSubSection = async(req, res) => {

// 	try {
// 		const {subSectionId,courseId} = req.body;
// 		const sectionId=req.body.sectionId;
//         if(!subSectionId || !sectionId){
//             return res.status(404).json({
//                 success: false,
//                 message: "All fields are required",
//             });
//         }
//         const ifsubSection = await SubSection.findById({_id:subSectionId});
//         const ifsection= await Section.findById({_id:sectionId});
//         if(!ifsubSection){
//             return res.status(404).json({
//                 success: false,
//                 message: "Sub-section not found",
//             });
//         }
//         if(!ifsection){
//             return res.status(404).json({
//                 success: false,
//                 message: "Section not found",
//             });
//         }
//         await SubSection.findByIdAndDelete(subSectionId);
//         await Section.findByIdAndUpdate({_id:sectionId},{$pull:{subSection:subSectionId}},{new:true});
//         const updatedCourse = await Course.findById(courseId).populate({ path: "courseContent", populate: { path: "subSection" } }).exec();
//         return res.status(200).json({ success: true, message: "Sub-section deleted", data: updatedCourse });

// 	} catch (error) {
// 		// Handle any errors that may occur during the process
//         console.error("Error deleting sub-section:", error);
//         return res.status(500).json({
//             success: false,
//             message: "Internal server error",
//             error: error.message,
//         });
// 	}
// };




// Create a new sub-section for a given section
exports.createSubSection = async (req, res) => {
    try {
        // Extract necessary information from the request body
        const { sectionId, title, description } = req.body
        const video = req.files.video

        // Check if all necessary fields are provided
        if (!sectionId || !title || !description || !video) {
            return res
                .status(404)
                .json({ success: false, message: "All Fields are Required" })
        }
        console.log(video)

        // Upload the video file to Cloudinary
        const uploadDetails = await uploadImageToCloudinary(
            video,
            process.env.FOLDER_NAME
        )
        console.log(uploadDetails)
        // Create a new sub-section with the necessary information
        const SubSectionDetails = await SubSection.create({
            title: title,
            timeDuration: `${uploadDetails.duration}`,
            description: description,
            videoUrl: uploadDetails.secure_url,
        })

        // Update the corresponding section with the newly created sub-section
        const updatedSection = await Section.findByIdAndUpdate(
            { _id: sectionId },
            { $push: { subSection: SubSectionDetails._id } },
            { new: true }
        ).populate("subSection")

        // Return the updated section in the response
        return res.status(200).json({ success: true, data: updatedSection })
    } catch (error) {
        // Handle any errors that may occur during the process
        console.error("Error creating new sub-section:", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        })
    }
}

exports.updateSubSection = async (req, res) => {
    try {
        const { sectionId, subSectionId, title, description } = req.body
        const subSection = await SubSection.findById(subSectionId)

        if (!subSection) {
            return res.status(404).json({
                success: false,
                message: "SubSection not found",
            })
        }

        if (title !== undefined) {
            subSection.title = title
        }

        if (description !== undefined) {
            subSection.description = description
        }
        if (req.files && req.files.video !== undefined) {
            const video = req.files.video
            const uploadDetails = await uploadImageToCloudinary(
                video,
                process.env.FOLDER_NAME
            )
            subSection.videoUrl = uploadDetails.secure_url
            subSection.timeDuration = `${uploadDetails.duration}`
        }

        await subSection.save()

        // find updated section and return it
        const updatedSection = await Section.findById(sectionId).populate(
            "subSection"
        )

        console.log("updated section", updatedSection)

        return res.json({
            success: true,
            message: "Section updated successfully",
            data: updatedSection,
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false,
            message: "An error occurred while updating the section",
        })
    }
}

exports.deleteSubSection = async (req, res) => {
    try {
        const { subSectionId, sectionId } = req.body
        await Section.findByIdAndUpdate(
            { _id: sectionId },
            {
                $pull: {
                    subSection: subSectionId,
                },
            }
        )
        const subSection = await SubSection.findByIdAndDelete({ _id: subSectionId })

        if (!subSection) {
            return res
                .status(404)
                .json({ success: false, message: "SubSection not found" })
        }

        // find updated section and return it
        const updatedSection = await Section.findById(sectionId).populate(
            "subSection"
        )

        return res.json({
            success: true,
            message: "SubSection deleted successfully",
            data: updatedSection,
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false,
            message: "An error occurred while deleting the SubSection",
        })
    }
}
