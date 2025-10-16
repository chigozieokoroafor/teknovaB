const joi = require("joi");
const { PARAMS } = require("../consts");

const couponCreateValidator = joi.object({
  [PARAMS.name]: joi.string().required().messages({
    "any.required": "Coupon name is required.",
    "string.base": "Coupon name must be a string.",
    "string.empty": "Coupon name cannot be empty."
  }),

  [PARAMS.code]: joi.string().required().messages({
    "any.required": "Coupon code is required.",
    "string.base": "Coupon code must be a string.",
    "string.empty": "Coupon code cannot be empty."
  }),

  [PARAMS.coupon_type]: joi
    .string()
    .valid("product", "category", "order", "shipping")
    .required()
    .messages({
      "any.required": "Coupon type is required.",
      "any.only": "Coupon type must be one of: product, category, order, or shipping.",
      "string.base": "Coupon type must be a string.",
      "string.empty": "Coupon type cannot be empty."
    }),

  [PARAMS.product_list]: joi.array().allow(null).messages({
    "array.base": "Product list must be an array if provided."
  }),

  [PARAMS.category_list]: joi.array().allow(null).messages({
    "array.base": "Category list must be an array if provided."
  }),

  [PARAMS.discount_value]: joi.number().required().messages({
    "any.required": "Discount value is required.",
    "number.base": "Discount value must be a number."
  }),

  [PARAMS.discount_type]: joi.string().required().messages({
    "any.required": "Discount type is required.",
    "string.base": "Discount type must be an string."
  }),

  [PARAMS.startDate]: joi.date().required().messages({
    "any.required": "Start date is required.",
    "date.base": "Start date must be a valid date."
  }),

  [PARAMS.endDate]: joi.date().required().messages({
    "any.required": "End date is required.",
    "date.base": "End date must be a valid date."
  }),

  [PARAMS.limit]: joi.number().required().messages({
    "any.required": "Limit is required.",
    "number.base": "Limit must be a valid number."
  }),

  [PARAMS.status]: joi.string().allow(null).messages({
    "string.base": "Status must be a string if provided."
  })
})
  .required()
  .messages({
    "object.base": "A valid coupon object is required.",
    "any.required": "Coupon data is required."
  });


const couponUpdateValidator = joi.object({
  [PARAMS.name]: joi.string().messages({
    "string.base": "Coupon name must be a string.",
    "string.empty": "Coupon name cannot be empty."
  }),

  [PARAMS.code]: joi.string().messages({
    "string.base": "Coupon code must be a string.",
    "string.empty": "Coupon code cannot be empty."
  }),

  [PARAMS.coupon_type]: joi
    .string()
    .valid("product", "category", "order", "shipping")
    .messages({
      "any.only": "Coupon type must be one of: product, category, order, or shipping.",
      "string.base": "Coupon type must be a string.",
      "string.empty": "Coupon type cannot be empty."
    }),

  [PARAMS.product_list]: joi.array().allow(null).messages({
    "array.base": "Product list must be an array if provided."
  }),

  [PARAMS.category_list]: joi.array().allow(null).messages({
    "array.base": "Category list must be an array if provided."
  }),

  [PARAMS.discount_value]: joi.number().messages({
    "number.base": "Discount value must be a number."
  }),

  [PARAMS.discount_type]: joi.string().valid("fixed", "percentage").messages({
    "any.only": "discount type must be one of: fixed or percentage.",
    "string.base": "Discount type must be an string."
  }),

  [PARAMS.startDate]: joi.date().messages({
    "date.base": "Start date must be a valid date."
  }),

  [PARAMS.endDate]: joi.date().messages({
    "date.base": "End date must be a valid date."
  }),

  [PARAMS.limit]: joi.number().messages({
    "number.base": "Limit must be a valid number."
  }),

  [PARAMS.status]: joi.string().allow(null).messages({
    "string.base": "Status must be a string if provided."
  })
})
  .min(1) // ✅ ensures at least one field is provided
  .messages({
    "object.base": "A valid coupon update object is required.",
    "object.min": "At least one field must be provided for update."
  });


const discountValidator = joi.object(
  {
    [PARAMS.productId]: joi.string().required().messages(
      {

        "string.base": "Kindly select a product to discount.",
        "string.empty": "Kindly select a product to discount."
      }
    ),

    [PARAMS.discount_value]: joi.number().required().messages(
      {
        "number.base": "Discount value must be a valid number."
      }
    ),

    [PARAMS.discount_type]: joi.string().valid("fixed", "percentage").messages({
      "any.only": "discount type must be one of: fixed or percentage.",
      "string.base": "Discount type must be an string."
    }),

    [PARAMS.startDate]: joi.date().messages({
      "date.base": "Start date must be a valid date."
    }),

    [PARAMS.endDate]: joi.date().messages({
      "date.base": "End date must be a valid date."
    }),
  }
)

module.exports = {
  couponCreateValidator,
  couponUpdateValidator,
  discountValidator
}