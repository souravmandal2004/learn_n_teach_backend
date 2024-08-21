const Category = require("../models/category.model.js");

// exports.createCategory = async (req, res) => {
//     try {
//         // fetch the data from request body
//         const { name, description } = req.body;

//         // validate the name and description
//         if (!name || !description) {
//             return res.status(403).json({
//                 success: false,
//                 message: "Please provide all the required fields."
//             });
//         }

//         // create entry in db
//         const categoryDetails = await Category.create({
//             name: name,
//             description: description,
//         });
//         console.log(categoryDetails);

//         // return response
//         return res.status(200).json({
//             success: true,
//             message: "Category created successfully.",
//             data: categoryDetails,
//         });
//     }
//     catch (error) {
//         console.log("Error while creating category", error.message);
//         return res.status(500).json({
//             success: false,
//             message: "Error while creating category. Please try again.",
//         });
//     }
// }


function getRandomInt(max) {
    return Math.floor(Math.random() * max)
}

// create category
exports.createCategory = async (req, res) => {
    try {
        const { name, description } = req.body
        if (!name) {
            return res
                .status(400)
                .json({ success: false, message: "All fields are required" })
        }
        const CategorysDetails = await Category.create({
            name: name,
            description: description,
        })
        console.log(CategorysDetails)
        return res.status(200).json({
            success: true,
            message: "Categorys Created Successfully",
        })
    } catch (error) {
        return res.status(500).json({
            success: true,
            message: error.message,
        })
    }
}
// get All the category
// exports.showAllCategory = async (req, res) => {
//     try {
//         // fetching all the category
//         const allCategory = await Category.find({}, { name: true, description: true });


//         // return the response
//         return res.status(200).json({
//             success: true,
//             message: "All category fetched successfully.",
//             allCategory,
//         });
//     }

//     catch (error) {

//         console.log("Error while getting all category", error.message);
//         return res.status(500).json({
//             success: false,
//             message: "Error while fetching all category. Please try again.",
//         });
//     }
// }

exports.showAllCategories = async (req, res) => {
    try {
        const allCategorys = await Category.find()
        res.status(200).json({
            success: true,
            data: allCategorys,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

// exports categoryPageDetails
exports.categoryPageDetails = async (req, res) => {
    try {
        const { categoryId } = req.body

        // Get courses for the specified category
        const selectedCategory = await Category.findById(categoryId)
            .populate({
                path: "courses",
                match: { status: "Published" },
                populate: "ratingAndReviews",
            })
            .exec()

        console.log("SELECTED COURSE", selectedCategory)
        // Handle the case when the category is not found
        if (!selectedCategory) {
            console.log("Category not found.")
            return res
                .status(404)
                .json({ success: false, message: "Category not found" })
        }

        // Handle the case when there are no courses
        if (selectedCategory.courses.length === 0) {
            console.log("No courses found for the selected category.")
            return res.status(404).json({
                success: false,
                message: "No courses found for the selected category.",
            })
        }

        // Get courses for other categories
        const categoriesExceptSelected = await Category.find({
            _id: { $ne: categoryId },
        })
        let differentCategory = await Category.findOne(
            categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)]
                ._id
        )
            .populate({
                path: "courses",
                match: { status: "Published" },
            })
            .exec()
        console.log()
        // Get top-selling courses across all categories
        const allCategories = await Category.find()
            .populate({
                path: "courses",
                match: { status: "Published" },
            })
            .exec()
        const allCourses = allCategories.flatMap((category) => category.courses)
        const mostSellingCourses = allCourses
            .sort((a, b) => b.sold - a.sold)
            .slice(0, 10)


        // return response  
        res.status(200).json({
            success: true,
            data: {
                selectedCategory,
                differentCategory,
                mostSellingCourses,
            },
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        })
    }
}