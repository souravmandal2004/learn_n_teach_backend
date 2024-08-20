const Category = require ("../models/category.model.js");

exports.createCategory = async (req, res) => {
    try {
        // fetch the data from request body
        const {name, description} = req.body;

        // validate the name and description
        if (!name || !description) {
            return res.status (403).json ({
                success: false,
                message: "Please provide all the required fields."
            });
        }

        // create entry in db
        const categoryDetails = await Category.create ({
            name: name,
            description: description,
        });
        console.log (categoryDetails);

        // return response
        return res.status (200).json ({
            success: true,
            message: "Category created successfully.",
            data: categoryDetails,
        });
    }
    catch (error) {
        console.log ("Error while creating category", error.message);
        return res.status (500).json ({
            success: false,
            message: "Error while creating category. Please try again.",
        });
    }
}

// get All the category
exports.showAllCategory = async (req, res) => {
    try {
        // fetching all the category
        const allCategory = await Category.find ({}, {name: true, description: true});


        // return the response
        return res.status (200). json ({
            success: true,
            message: "All category fetched successfully.",
            allCategory,
        });
    } 

    catch (error) {

        console.log ("Error while getting all category", error.message);
        return res.status (500). json ({
            success: false,
            message: "Error while fetching all category. Please try again.",
        });
    }
}