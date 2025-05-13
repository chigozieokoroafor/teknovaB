const { PARAMS } = require("../../util/consts");
const { product } = require("../models/product");

exports.uploadProduct = async (data) => {
    return await product.create(data)
}

exports.getProductsByCategory = async (categoryId, limit, offset) => {
    return await product.findAll(
        {
            where: {
                categoryId
            },
            attributes: [
                PARAMS.uid,
                PARAMS.name,
                PARAMS.img_url,
                PARAMS.price,
                PARAMS.discount,
                PARAMS.specifications
            ],
            offset,
            limit
        }
    )
}

exports.getspecificProduct = async (productId) => {
    return await product.findOne(
        {
            where: {
                id: productId
            },
            attributes:[PARAMS.categoryId, PARAMS.colors, PARAMS.description, PARAMS.discount, PARAMS.img_url, PARAMS.name, PARAMS.price, PARAMS.id, PARAMS.units],

        }
    )
}

exports.searchProduct = async (query, offset, limit) => {
    return await product.findAll(
        {
            where: query,
            attributes: [PARAMS.categoryId, PARAMS.colors, PARAMS.description, PARAMS.discount, PARAMS.img_url, PARAMS.name, PARAMS.price, PARAMS.uid, PARAMS.units, PARAMS.specifications],
            offset,
            limit
        }

    )
}