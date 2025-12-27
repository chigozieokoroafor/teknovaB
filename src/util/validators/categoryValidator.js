const Joi = require("joi");
const { PARAMS } = require("../consts");

const specificationsSchema = Joi.object({
    name: Joi.string().required().messages({
        "any.required": "specification name required",
        "string.base": "name of specification required."
    }),
    values: Joi.alternatives().try(
        Joi.string().messages({
            "string.base": "values required as comma separated strings."
        }),
        Joi.array().items(Joi.string()).messages({
            "array.base": "values must be an array of strings.",
            "array.includes": "all values must be strings."
        })
    ).required().messages({
        "any.required": "values for specification required."
    })
}).required().messages({
    "any.required": "specification object required."
});


exports.categoryCreationSchema = Joi.object(
    {
        name: Joi.string().required().messages(
            {
                "any.required": "Kindly provide a category name",
                "string.empty": "Kindly provide a category name"
            }
        ),
        
        [PARAMS.imageId]: Joi.number().required().messages(
            {
                "any.required": "Image for categoy required",
                
            }
        ),
        specifications:Joi.array().min(0).items(specificationsSchema).messages(
            {
                "any.required":"Kindly select specifications for category",
                "array.min.base":"At least one specification must be provided."
            }
        ),
        parentId: Joi.string()
    }
).required().messages(
    {
        "any.required": "Kindly upload a category to continue."
    }
)

exports.categoryUpdateSchema = Joi.object(
    {
        name: Joi.string().messages(
            {
                "any.required": "Kindly provide a category name",
                "string.empty": "Kindly provide a category name"
            }
        ),
        [PARAMS.imageId]: Joi.number().messages(
            {
                "any.required": "Image for categoy required",
                
            }
        ),
        specifications:Joi.array().min(1).items(specificationsSchema).messages(
            {
                "any.required":"Kindly select specifications for category",
                "array.min.base":"At least one specification must be provided."
            }
        ),
        parentId: Joi.string()
    }
).required().messages(
    {
        "any.required": "Kindly upload a category to continue."
    }
)
