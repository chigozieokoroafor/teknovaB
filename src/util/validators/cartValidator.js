const Joi = require("joi")
const { PARAMS } = require("../consts")

exports.addToCartSchema = Joi.object(
    {
        [PARAMS.productId]: Joi.string().required().messages(
            {
                "any.required": "Kindly select a product to add to cart.",
                "string.empty": "Kindly select a valid product to add to cart."
            }
        ),
        [PARAMS.units]: Joi.number().required().messages(
            {
                "any.required": "kindly provide the units of products being purchased.",
                "number.empty": "Units to be purchased cannot be less than 1."
            }
        ),
        // [PARAMS.unit_price]:Joi.number().required().messages(
        //     {
        //         "any.required": "kindly provide the unit price of products being purchased.",
        //         // "number.empty": "Unit price  of product to be purchased cannot be less than 1."
        //     }
        // ),
        [PARAMS.specifications]: Joi.array(
            // {
            //     "color",
            //     "size"
            // }
        ).items(
            Joi.object({
                "name": Joi.string().required().messages({ "any.required": "name of specification selected, required" }),
                "value": Joi.string().required().messages({ "any.required": "value of specification selected, required" }),
            }).required().messages({
                "any.required": "Kindly provide a product specification."
            })
        ).required().messages(
            {
                "any.required": "Kindly provide a product specification.",
                'array.includesRequiredUnknowns': "specifications must contain atleast one item. "
            }
        )
    }
).required().messages(
    {
        "any.required": "Cart details required",
        "object.empty": "product to upload cannot be empty"
    }
)


exports.checkoutSchema = Joi.object(
    {
        [PARAMS.billing_address]: Joi.object(
            {
                [PARAMS.street]: Joi.string().required().messages(
                    {
                        "any.required": "Kindly provide a street",

                    }),
                [PARAMS.country]: Joi.string().required().messages(
                    {
                        "any.required": "Kindly provide a country destination.",

                    }),
                [PARAMS.town]: Joi.string().required().messages(
                    {
                        "any.required": "Kindly provide town/city",

                    }),
                [PARAMS.state]: Joi.string().required().messages(
                    {
                        "any.required": "Kindly provide a state",

                    }),
                [PARAMS.zip]: Joi.string().required().messages(
                    {
                        "any.required": "Kindly provide a location  zipcode"
                    }),

            }
        ).required().messages(
            {
                "any.required": "Kindly provide the address oackage will be delivered to of receipient.",
                "object.base": "Billing address must be of object type"
            }
        ),
        [PARAMS.contact_Info]:
            Joi.object({
                [PARAMS.firstName]: Joi.string().required().messages(
                    {
                        "any.required": "Kindly provide a first name",

                    })
                ,
                [PARAMS.lastName]: Joi.string().required().messages(
                    {
                        "any.required": "Kindly provide a last name",
                    }
                ),
                [PARAMS.phone_no]: Joi.string().required().messages(
                    {
                        "any.required": "Kindly provide Reciepient's phone number.",
                    }
                )
            }).required().messages(
                {
                    "any.required": "Kindly provide the contact info of receipient."
                }
            )

    }
).required().messages(
    {
        "any.required": "Checkout details required",
        "object.empty": "Cart to checkout cannot be empty"
    }
)