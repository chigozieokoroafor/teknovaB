const { Op } = require("sequelize");
const { PARAMS, RELATIONSHIP_NAMES, MODEL_NAMES } = require("../../util/consts");
const { product, product_images, images, category } = require("../models/relationships");

const productAttributes = [
    PARAMS.categoryId,
    PARAMS.uid,
    PARAMS.name,
    PARAMS.price,
    PARAMS.units,
    PARAMS.description,
    MODEL_NAMES.product_specifications
]

exports.uploadProduct = async (data) => {
    return await product.create(data)
}

exports.getProductsByCategory = async (query, limit, offset) => {

    query[PARAMS.isDeleted] = false
    query[PARAMS.isActive] = true
    return await product.findAll(
        {
            where: query,
            attributes: productAttributes,
            include: [
                {
                    model: category,
                    as: RELATIONSHIP_NAMES.category,
                    attributes: [PARAMS.uid, PARAMS.name]
                },
                {
                    model: product_images,
                    attributes: [PARAMS.id, PARAMS.imageId],
                    include: {
                        model: images,
                        attributes: [PARAMS.img_url],
                        as: RELATIONSHIP_NAMES.image
                    }
                },

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
                [PARAMS.isDeleted]: false
            },
            attributes: productAttributes,
            include: [
                {
                    model: category,
                    as: RELATIONSHIP_NAMES.category,
                    attributes: [PARAMS.uid, PARAMS.name]
                },
                {
                    model: product_images,
                    attributes: [PARAMS.id, PARAMS.imageId],
                    include: {
                        model: images,
                        attributes: [PARAMS.img_url],
                        as: RELATIONSHIP_NAMES.image
                    }
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
            attributes: productAttributes,
            include: [
                {
                    model: category,
                    as: RELATIONSHIP_NAMES.category,
                    attributes: [PARAMS.uid, PARAMS.name]
                },
                {
                    model: product_images,
                    attributes: [PARAMS.id, PARAMS.imageId],
                    include: {
                        model: images,
                        attributes: [PARAMS.img_url],
                        as: RELATIONSHIP_NAMES.image
                    }
                },
            ],
            offset,
            limit
        }

    )
}

exports.deleteProductQuery = async (productId) => {
    return await product.update({ [PARAMS.isDeleted]: true }, { where: { [PARAMS.uid]: productId } })
}

exports.uploadProductImages = async (data) => {
    return await product_images.bulkCreate(data)
}

exports.updateProductDetails = async (productId, update) => {
    return await product.update(update, { where: { uid: productId } })
}

exports.deleteProductImages = async (productId) => {
    return await product_images.destroy(
        {
            where: {
                productId,
                // imageIds: {
                //     [Op.notIn]: imageIds
                // }
            }
        }
    )
}

exports.getspecificProductRaw = async (productId) => {
    return await product.findOne(
        {
            where: {
                [PARAMS.uid]: productId,
                [PARAMS.isDeleted]: false
            },
            // attributes: [
            //     PARAMS.categoryId,
            //     PARAMS.uid,
            //     PARAMS.name,
            //     PARAMS.price,
            //     PARAMS.units
            // ],
            include: [
                {
                    model: category,
                    as: RELATIONSHIP_NAMES.category,
                    attributes: [PARAMS.uid, PARAMS.name]
                },
                {
                    model: product_images,
                    attributes: [PARAMS.id, PARAMS.imageId],
                    include: {
                        model: images,
                        attributes: [PARAMS.img_url],
                        as: RELATIONSHIP_NAMES.image
                    }
                },
            ],

        }
    )
}

exports.getNewProducts = async () => {

    return await product.findAll(
        {
            where: {
                [PARAMS.isDeleted]: false,
                [PARAMS.isActive] : true

            },
            attributes: [...productAttributes, PARAMS.createdAt],
            include: [
                {
                    model: category,
                    as: RELATIONSHIP_NAMES.category,
                    attributes: [PARAMS.uid, PARAMS.name]
                },
                {
                    model: product_images,
                    attributes: [PARAMS.id, PARAMS.imageId],
                    include: {
                        model: images,
                        attributes: [PARAMS.img_url],
                        as: RELATIONSHIP_NAMES.image
                    }
                },
            ],
            order: [[PARAMS.createdAt, "DESC"]],
            limit: 10
        }

    )
}
