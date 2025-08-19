const { PARAMS, RELATIONSHIP_NAMES } = require("../../util/consts");
const { product, product_specifications, product_images, images, category} = require("../models/relationships");

exports.uploadProduct = async (data) => {
    return await product.create(data)
}

exports.getProductsByCategory = async (categoryId, limit, offset) => {
    return await product.findAll(
        {
            where: {
                categoryId,
                [PARAMS.isDeleted]:false,
                [PARAMS.isActive]: true
            },
            attributes: [
                PARAMS.uid,
                PARAMS.name,
                PARAMS.price,
                PARAMS.units
            ],
            include:[
                 {
                    model: category,
                    as: RELATIONSHIP_NAMES.category,
                    attributes: [PARAMS.uid, PARAMS.name]
                },
                {
                    model: product_images,
                    attributes: [PARAMS.id,PARAMS.imageId],
                    include: {
                        model: images,
                        attributes: [PARAMS.img_url],
                        as: RELATIONSHIP_NAMES.image
                    }
                },
                {
                    model: product_specifications,
                    attributes: [PARAMS.name, PARAMS.values]
                }
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
                [PARAMS.uid]: productId,
                [PARAMS.isDeleted]:false
            },
            attributes: [
                PARAMS.categoryId,
                PARAMS.uid,
                PARAMS.name,
                PARAMS.price,
                PARAMS.units
            ],
            include:[
                {
                    model: category,
                    as: RELATIONSHIP_NAMES.category,
                    attributes: [PARAMS.uid, PARAMS.name]
                },
                {
                    model: product_images,
                    attributes: [PARAMS.id,PARAMS.imageId],
                    include: {
                        model: images,
                        attributes: [PARAMS.img_url],
                        as: RELATIONSHIP_NAMES.image
                    }
                },
                {
                    model: product_specifications,
                    attributes: [PARAMS.name, PARAMS.values]
                }
            ],

        }
    )
}

exports.searchProduct = async (query, offset, limit) => {

    query[PARAMS.isDeleted] = false
    query[PARAMS.isActive] = true

    return await product.findAll(
        {
            where: query,
            attributes: [
                PARAMS.categoryId,
                PARAMS.uid,
                PARAMS.name,
                PARAMS.price,
                PARAMS.units
            ],
            include:[
                {
                    model: category,
                    as: RELATIONSHIP_NAMES.category,
                    attributes: [PARAMS.uid, PARAMS.name]
                },
                {
                    model: product_images,
                    attributes: [PARAMS.id,PARAMS.imageId],
                    include: {
                        model: images,
                        attributes: [PARAMS.img_url],
                        as: RELATIONSHIP_NAMES.image
                    }
                },
                {
                    model: product_specifications,
                    attributes: [PARAMS.name, PARAMS.values]
                }
            ],
            offset,
            limit
        }

    )
}

exports.deleteProductQuery = async(productId) =>{
    return await product.update({[PARAMS.isDeleted]:true}, {where:{[PARAMS.uid]:productId}})
}

exports.uploadProductSpecification = async(data) =>{
    return await product_specifications.bulkCreate(data)
}

exports.uploadProductImages = async(data) =>{
    return await product_images.bulkCreate(data)
}