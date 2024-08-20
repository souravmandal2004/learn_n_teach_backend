const Tag = require ("../models/tag.model.js");

exports.createTag = async (req, res) => {
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
        const tagDetails = await Tag.create ({
            name: name,
            description: description,
        });
        console.log (tagDetails);

        // return response
        return res.status (200).json ({
            success: true,
            message: "Tag created successfully.",
            data: tagDetails,
        });
    }
    catch (error) {
        console.log ("Error while creating tag", error.message);
        return res.status (500).json ({
            success: false,
            message: "Error while creating tag. Please try again.",
        });
    }
}

// get All the tags
exports.showAllTags = async (req, res) => {
    try {
        // fetching all the tags
        const allTags = await Tag.find ({}, {name: true, description: true});


        // return the response
        return res.status (200). json ({
            success: true,
            message: "All tags fetched successfully.",
            allTags,
        });
    } 

    catch (error) {

        console.log ("Error while getting all tags", error.message);
        return res.status (500). json ({
            success: false,
            message: "Error while fetching all tags. Please try again.",
        });
    }
}