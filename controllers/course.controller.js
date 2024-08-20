const Course = require ("../models/course.model.js");
const Section = require ("../models/section.model.js");
const SubSection = require ("../models/subSection.model.js");
const CourseProgress = require ("../models/courseProgress.model.js");
const User = require ("../models/user.model.js");
const Tag = require ("../models/tag.model.js");
const {uploadImageToCloudinary} = require ("../utils/imageUploader.js"); 
require ("dotenv").config ();   

// create course
exports.createCourse = async (req, res) => {

    try {

        // Get user ID from request object
        const userId = req.user.id;

        // fetch the data from request body
        let {
            courseName,
            courseDescription,
            whatYouWillLearn,
            price,
            tag,
        } = req.body;

        // fetch the thumbnail
        const thumbnail = req.files.thumbnailImage;

        // validation
        if (!courseName ||
            !courseDescription ||
            !whatYouWillLearn ||
            !price ||
            !tag ||
            !thumbnail ){
                return res.status (400). json ({
                    success: false,
                    message: "Please provide all the required fields."
                });
        }

        // check for instructor
        const instructorDetails = await User.findById ({userId});
        console.log ("Instructor Details: ", instructorDetails);

        if (!instructorDetails) {
            return res.status (403).json ({
                success: false,
                message: "Instructor Details not found."
            });
        }

        // check given tag is valid or not
        const tagDetails = await Tag.findById ({tag});

        if (!tagDetails) {
            return res.status (403).json ({
                success: false,
                message: "Tag Details not found."
            });
        }

        // upload thumbnail image to cloudinary
        const thumbnailImage = await uploadImageToCloudinary (thumbnail, process.env.FOLDER_NAME);

        // create an entry for new course
        const newCourse = await Course.create ({courseName, courseDescription, instructor: instructorDetails._id, whatYouWillLearn, price, tag:tagDetails._id, thumbnail: thumbnailImage.secure_url});

        // add the new course to the user Schema of instructor
        await User.findByIdAndUpdate (
            {_id: instructorDetails._id},
            {$push: 
                {courses: newCourse._id,}
            },
            {new: true},
        );

        // update the tag schema
        await Tag.findByIdAndUpdate (
            {_id: tagDetails._id},
            {$push: 
                {course: newCourse._id,}
            },
            {new: true}
        );

        // return response
        return res.status (200). json ({
            success: true,
            message: "Course created successfully.",
            data: newCourse,
        })

    }
    catch (error) {

        console.log ("Error while creating course", error.message);
        return res.status (500).json ({
            success: false,
            message: "Error while creating course. Please try again.",
        });
    }
}

// get all courses
exports.getAllCourses = async (req, res) => {
    try {
        const allCourses = await Course.find ({}, { courseName: true,
                                                    price: true,
                                                    thumbnail: true,
                                                    instructor: true,
                                                    studentsEnrolled: true,
                                                    ratingAndReviews: true
        }). populate ("instructor"). exec ();

        return res.status (200). json ({
            success: true,
            message: "All courses fetched successfully.",
            data: allCourses,
        });
    }

    catch (error) {
        console.log ("Error while getting all courses", error.message);
        return res.status (500).json ({
            success: false,
            message: "Error while getting all courses. Please try again.",
        });
    }
}