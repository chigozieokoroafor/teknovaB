const Joi = require("joi");

const specificationsSchema = Joi.object(
    {
        name: Joi.string().required().messages(
            {
                "any.required": "specification name required",
                "string.base": "name of specification required.",
                "string.empty": "provide name of specification, "
            }
        ),
        values: Joi.string().required().messages(
            {
                "any.required": "values for specification required.",
                "string.base": "values required as comma seperated strings.",
                "string.empty": "values for specification are required."
            }
        )
    }
).required().messages(
    {
        "any.required": "specification object requred."
    }
)

exports.productUploadSchema = Joi.object(
    {
        name: Joi.string().required().messages(
            {
                "any.required": "Name of product required",
                "string.empty": "Kindly provide a name of the product"
            }
        ),
        categoryId: Joi.string().required().messages(
            {
                "any.required": "Kindly select a category the product falls under",
                "string.empty": "Kindly provide a category"
            }
        ),
        discount: Joi.number().messages(
            {
                "number.base": "Discount required as a number.",
                "number.empty": "Discount should be set as zero if none."
            }
        ),
        price: Joi.number().required().messages(
            {
                "any.required": "Price of product required.",
                "number.base": "Kindly provide the price of the product.",
                "number.empty": "Number cannot be empty."
            }
        ),

        description: Joi.string().messages({ "string.base": "Kindly provide a valid description." }),

        units: Joi.number().required().messages(
            {
                "any.required": "Units of product is required.",
                "number.base": "Kindly provide the product units as a number"
            }
        ),

        specifications: Joi.array().items(
            specificationsSchema
        ).messages({
            "array.base": "Specifications must be an array",
            "array.includesRequiredUnknowns": "Specifications items must contain ram, rom and cost."
        }),

        images: Joi.array().required().messages(
            {
                "any.required": "Provide image ids",
                "array.base": "provide at least one image id"
            }
        )

    }
).required().messages(
    {
        "any.required": "Kindly upload a product to continue."
    }
)