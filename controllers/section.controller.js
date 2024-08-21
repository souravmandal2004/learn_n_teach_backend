const Section = require("../models/section.model.js");
const SubSection = require("../models/subSection.model.js");
const Course = require("../models/course.model.js");


// // create section
// exports.createSection = async (req, res) => {
//     try {
//         // fetch data
//         const {sectionName, courseId} = req.body;

//         // validate the data
//         if (!sectionName || !courseId) {
//             return res.status (400).json ({
//                 success: false,
//                 message: "Please provide all the required fields."
//             });
//         }

//         // create a new section
//         const newSection = await Section.create ({sectionName});

//         // update course with the objectId of section   
//         const updatedCourse = Course.findByIdAndUpdate ({courseId}, {$push: {courseContent: newSection._id}}, {new: true}).populate({
//             path: "courseContent",
//             populate: {
//                 path: "subSection",
//             },
//         })
//         .exec();

//         // return response
//         return res.status (200). json ({
//             success: true,
//             message: "Section created successfully.",
//             data: newSection,
//         });
//     }

//     catch (error) {
//         console.log ("Error while creating section", error.message);
//         return res.status (500).json ({
//             success: false,
//             message: "Error while creating section. Please try again.",
//         });
//     }
// }


// // update section
// exports.updateSection = async (req, res) => {
//     try {

//         // data input
//         const {sectionName, sectionId} = req.body;

//         // data validate
//         if (!sectionName || !sectionId) {
//             return res.status (404). json ({
//                 success: false,
//                 message: "Please provide all the required fields."
//             });
//         }

//         // update data
//         const section = await Section.findByIdAndUpdate ({sectionId}, {sectionName}, {new: true});

//         // return response
//         return res.status (200). json ({
//             success: true,
//             message: "Section updated successfully.",
//             data: section,
//         });
//     }

//     catch (error) {
//         console.log ("Error while updating section", error.message);
//         return res.status (500).json ({
//             success: false,
//             message: "Error while updating section. Please try again.",
//         });
//     }
// }


// // delete section
// exports.deleteSection = async (req, res) => {

//     try {
//         // get id -- assuming that we are sending the id in params
//         const {sectionId, courseId} = req.params;

//         // findByIdAndDelete 
//         await Section.findByIdAndDelete(sectionId);

//         // delete the objectId from the Course schema
//         const updatedCourse = await Course.findById(courseId).populate({ path: "courseContent", populate: { path: "subSection" } }).exec();

//         // return response
//         return res.status(200).json ({
//             success: true,
//             message: "Section deleted successfully."
//         });
//     }

//     catch (error) {
//         console.log ("Error while deleting section", error.message);
//         return res.status (500). json ({
//             success: false,
//             message: "Error while deleting section. Please try again.",
//         });
//     }   
// }



// CREATE a new section
exports.createSection = async (req, res) => {
    try {
        // Extract the required properties from the request body
        const { sectionName, courseId } = req.body

        // Validate the input
        if (!sectionName || !courseId) {
            return res.status(400).json({
                success: false,
                message: "Missing required properties",
            })
        }

        // Create a new section with the given name
        const newSection = await Section.create({ sectionName })

        // Add the new section to the course's content array
        const updatedCourse = await Course.findByIdAndUpdate(
            courseId,
            {
                $push: {
                    courseContent: newSection._id,
                },
            },
            { new: true }
        )
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection",
                },
            })
            .exec()

        // Return the updated course object in the response
        res.status(200).json({
            success: true,
            message: "Section created successfully",
            updatedCourse,
        })
    } catch (error) {
        // Handle errors
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        })
    }
}

// UPDATE a section
exports.updateSection = async (req, res) => {
    try {
        const { sectionName, sectionId, courseId } = req.body
        const section = await Section.findByIdAndUpdate(
            sectionId,
            { sectionName },
            { new: true }
        )
        const course = await Course.findById(courseId)
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection",
                },
            })
            .exec()
        console.log(course)
        res.status(200).json({
            success: true,
            message: section,
            data: course,
        })
    } catch (error) {
        console.error("Error updating section:", error)
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        })
    }
}

// DELETE a section
exports.deleteSection = async (req, res) => {
    try {
        const { sectionId, courseId } = req.body
        await Course.findByIdAndUpdate(courseId, {
            $pull: {
                courseContent: sectionId,
            },
        })
        const section = await Section.findById(sectionId)
        console.log(sectionId, courseId)
        if (!section) {
            return res.status(404).json({
                success: false,
                message: "Section not found",
            })
        }
        // Delete the associated subsections
        await SubSection.deleteMany({ _id: { $in: section.subSection } })

        await Section.findByIdAndDelete(sectionId)

        // find the updated course and return it
        const course = await Course.findById(courseId)
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection",
                },
            })
            .exec()

        res.status(200).json({
            success: true,
            message: "Section deleted",
            data: course,
        })
    } catch (error) {
        console.error("Error deleting section:", error)
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        })
    }
}
