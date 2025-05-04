const { product } = require("../models/product");

exports.uploadProduct = async (data) => {
    return await product.create(data)
}

exports.getProductsByCategory = async (categoryId, limit, offset) => {
    return await product.findAll(
        {
            where:{
                categoryId
            },
            offset,
            limit
            
        }
    )
}