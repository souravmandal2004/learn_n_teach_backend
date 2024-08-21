const {instance} = require ("../config/razorpay.js");
const Course = require ("../models/course.model.js");
const User = require ("../models/user.model.js");
const mailSender = require ("../utils/mailSender.util.js");
const {courseEnrollmentEmail} = require ("../mail/templates/courseEnrollmentEmail.js");
const mongoose = require ("mongoose");


// capture and initiate the Razorpay order
exports.capturePayment = async (req, res) => {
    try {
        // get courseId and userId
        const {courseId} = req.body;
        const userId  = req.body.id;

        // valid courseId
        if (!courseId) {
            return res.status (400).json ({
                success: false,
                message: "Invalid course ID."
            });
        }

        // valid courseDetails
        let courseDetails;
        try {
            courseDetails = await Course.findById (courseId);
            if (!courseDetails) {
                return res.status (404).json ({
                    success: false,
                    message: "Course not found."
                });
            }

            // user alread paid for the course or not
            const uid = new mongoose.Types.ObjectId (userId);       // convert id (String) to ObjectId

            if (courseDetails.studentsEnrolled.includes(uid)) {
                return res.status (400).json ({
                    success: false,
                    message: "User has already enrolled for this course."
                });
            }
        }

        catch (error) {
            console.log ("Error while fetching course details", error.message);
            return res.status (500).json ({
                success: false,
                message: "Error while fetching course details. Please try again."
            });
        }

        // create the options object 
        const amount = courseDetails.price;
        const currency = "INR";
        
        const options = {
            amount: amount * 100,
            currency: currency,
            receipt: Math.random (Date.now ()).toString(),
            notes: {
                courseId: courseId,
                userId: userId,
            }
        };

        // create the order
        try {
            // initiate the payment using razorpay
            const paymentResponse = await instance.orders.create (options);
            console.log ("The response of the payment is: ", paymentResponse);

            // return response
            return res.status (200).json ({
                success: true,
                message: "Payment initiated successfully.",
                courseName: courseDetails.courseName,
                courseDescription: courseDetails.courseDescription,
                thumbnail: courseDetails.thumbnail,
                orderId: paymentResponse.id,
                currency: paymentResponse.currency,
                amount: paymentResponse.amount,
            });
        }

        catch (error) {
            console.log ("Error while creating the order", error.message);
            return res.status (500).json ({
                success: false,
                message: "Error while creating the order. Please try again."
            });
        }
    }

    catch (error) {
        console.log ("Error while capturing the payment", error.message);

        return res.status (500). json ({
            success: false,
            message: "Error while capturing the payment. Please try again."
        });
    }
}


// verify signature
exports.verifySignature = async (req, res) => {
    try {
        const webHookSecret = "12345678";
        const signature = req.headers ["x-razorpay-signature"];         // razor pay secret key

        const shaSum = crypto.createHmac ("sha256", webHookSecret);

        // convert it to string
        shaSum.update (JSON.stringify (req.body));

        const digest = shaSum.digest ("hex"); // convert it to hexa decimal format

        // compare the signature and digest
        if (signature === digest) {
            console.log ("Payment is authorized!");

            // Now give the course to the student
            // get the courseId and userId
            const {courseId, userId} = req.body.payload.payment.entity.notes;

            try {
                // find the course and enroll the student in it
                const enrolledCourse = await Course.findByIdAndUpdate ({_id: courseId}, {$push: {
                    studentsEnrolled: userId
                }}, {new: true});

                if (!enrolledCourse) {
                    return res.status (404). json ({
                        success: false,
                        message: "Course not found."
                    });
                }

                console.log ("Enrolled courses: ", enrolledCourse);

                // find the student and add the course
                const enrolledStudents = await User.findByIdAndUpdate ({_id: userId}, {$push: {courses: courseId}}, {new: true});

                console.log ("Enrolled students: ", enrolledStudents);

                // Now send the mail to the students
                const emailResponse = await mailSender (enrolledStudents.email, "Congratulatons from LearnNTeach", "Congratulatons, you are now onboarded into new LearnNTeach courses.");

                console.log ("Email sent: ", emailResponse);

                // return response
                return res.status (200).json ({
                    success: true,
                    message: "Payment authorized and course enrolled successfully."
                });
            }   
            
            catch (error) {
                console.log ("Error while Enrolling the student: ", error.message);

                return res.status (500).json ({
                    success: false,
                    message: "Error while enrolling the student. Please try again."
                });
            }
        }
        else {
            // if signature doesnot match
            return res.status (500). json ({
                success: false,
                message: "Invalid signature. Please try again."
            });
        }
    }

    catch (error) {
        console.log ("Error while verifying the signature", error.message);
        return res.status (500).json ({
            success: false,
            message: "Error while verifying the signature. Please try again."
        });
    }
}