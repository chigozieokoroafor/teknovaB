const { PARAMS } = require("../../util/consts");
const { cart } = require("../models/cart");
const { product } = require("../models/product");

exports.addToCartQuery = async (data) =>{
    return await cart.create(data)
}

exports.fetchCartItems = async(uid, offset, limit) =>{
    return await cart.findAll(
        {
            where:{
                uid
            },
            include:[
                {
                    model:product,
                    attributes:[PARAMS.uid, PARAMS.img_url, PARAMS.specifications, PARAMS.name]
                }
            ],
            offset,
            limit
        }
    )
}