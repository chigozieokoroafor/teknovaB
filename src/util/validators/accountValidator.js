const Joi = require("joi");

exports.createAccountSchema = Joi.object(
    {
        email: Joi.string().email().required().messages({
            "any.required": "Email required",
            "string.empty": "Email Cannot be empty",
            "string.email.base": "Kindly provide a valid email",
        }),
        password: Joi.string().min(3).required().messages({
            "any.required": "Password required",
            "string.min.base": "Password can not be less than 3 characters.",
            "string.empty": "Password can not be empty"
        }),
        name: Joi.string().required().messages({
            "any.required": "Name required",
            "string.empty": "Name can not be empty"
        }),

        username: Joi.string().messages({
            "string.base": "kindly enter a prefered username",
            "string.empty": "Username should not be empty."
        })
    }
).required().messages({
    "any.required": "Account object required."
})

exports.loginValidator = Joi.object(
    {
        email: Joi.string().email().required().messages(
            {
                "any.required": "email required",
                "string.empty": "email cannot be empty",
                "string.emall.base": "kindly provide a valid email"
            }
        ),
        password: Joi.string().required().messages(
            {
                "any.required": "Password required",
                "string.empty": "Password cannot be empty."
            }
        )


    }
).required().messages(
    {
        "any.required": "Kindly provide an email and password before proceeding."
    }
)

exports.contactUsValidator = Joi.object(
    {
        email: Joi.string().email().required().messages({
            "any.required": "Email required",
            "string.empty": "Email Cannot be empty",
            "string.email.base": "Kindly provide a valid email",
        }),
        name: Joi.string().required().messages({
            "any.required": "Name required",
            "string.empty": "Name can not be empty"
        }),
        message: Joi.string().required().messages(
            {
                "any.required": "Message required",
                "string.empty": "MEssage can not be empty"
            }
        )

    }
).required().messages(
    {
        "any.required": "Kindly provide an email, name and message before proceeding."
    }
)