const Joi = require("joi");

exports.productUploadSchema = Joi.object(
    {   
        name: Joi.string().required().messages(
            {
                "any.required": "Name of product required",
                "string.empty": "Kindly provide a name of the product"
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
        colors: Joi.array().required().messages(
            {
                "any.required": "Kindly add the colors of the product.",
                "array.empty": "Colors can not be empty."
            }
        ),
        description: Joi.string().messages({"string.base":"Kindly provide a valid description."}),
        units: Joi.number().required().messages(
            {
                "any.required": "Units of product is required.",
                "number.base": "Kindly provide the product units as a number"
            }
        ),
        specifications: Joi.array().items(
            Joi.object({
                spec: Joi.string().required().messages({
                    "any.required": "Specification name is required",
                    "string.empty": "Specification name cannot be empty"
                }),
                extraCost: Joi.number().default(0).messages({
                    "number.base": "Extra cost must be a number"
                })
            })
        ).messages({
            "array.base": "Specifications must be an array",
            "array.includesRequiredUnknowns": "Specifications items must contain spec and extraCost"
        })
    }
).required().messages(
    {
        "any.required": "Kindly upload a product to continue."
    }
)