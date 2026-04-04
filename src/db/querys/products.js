const { Op } = require("sequelize");
const { PARAMS, RELATIONSHIP_NAMES, MODEL_NAMES } = require("../../util/consts");
const { product, product_images, images, category_, productDiscount } = require("../models/relationships");
const { conn } = require("../base");

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

    // console.log(query)


    return await product.findAll(
        {
            where: query,
            attributes: productAttributes,
            include: [
                {
                    model: category_,
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
                {
                    model: productDiscount,
                    where: {
                        [Op.and]: [
                            { [PARAMS.startDate]: { [Op.lt]: new Date() } },
                            { [PARAMS.endDate]: { [Op.gte]: new Date() } }
                        ]
                    },
                    required: false
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
                [PARAMS.isDeleted]: false
            },
            attributes: productAttributes,
            include: [
                {
                    model: category_,
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
                {
                    model: productDiscount,
                    where: {
                        [Op.and]: [
                            { [PARAMS.startDate]: { [Op.lt]: new Date() } },
                            { [PARAMS.endDate]: { [Op.gte]: new Date() } }
                        ]
                    },
                    required: false
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
                    model: category_,
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
                {
                    model: productDiscount,
                    where: {
                        [Op.and]: [
                            { [PARAMS.startDate]: { [Op.lt]: new Date() } },
                            { [PARAMS.endDate]: { [Op.gte]: new Date() } }
                        ]
                    },
                    required: false
                }
            ],
            offset,
            limit
        }

    )
}

exports.getDiscountedProducts = async (query, offset, limit) => {

    query[PARAMS.isDeleted] = false
    query[PARAMS.isActive] = true

    return await product.findAll(
        {
            where: query,
            attributes: productAttributes,
            include: [
                {
                    model: category_,
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
                {
                    model: productDiscount,
                    where: {
                        [Op.and]: [
                            { [PARAMS.startDate]: { [Op.lt]: new Date() } },
                            { [PARAMS.endDate]: { [Op.gte]: new Date() } }
                        ]
                    },
                    required: true
                }
            ],
            offset,
            limit
        }

    )
}

exports.getProductsWithoutDiscount = async (offset, limit) => {
    let query = {}

    query[PARAMS.isDeleted] = false
    query[PARAMS.isActive] = true

    // Add condition to exclude products with active discounts
    query[PARAMS.uid] = {
        [Op.notIn]: conn.literal(`(
            SELECT DISTINCT ${PARAMS.productId} 
            FROM ${MODEL_NAMES.productdiscount}s
            WHERE ${PARAMS.startDate} < NOW() 
            AND ${PARAMS.endDate} >= NOW()
        )`)
    }

    return await product.findAll(
        {
            where: query,
            attributes: productAttributes,
            include: [
                {
                    model: category_,
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
                    model: category_,
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
                {
                    model: productDiscount,
                    where: {
                        [Op.and]: [
                            { [PARAMS.startDate]: { [Op.lt]: new Date() } },
                            { [PARAMS.endDate]: { [Op.gte]: new Date() } }
                        ]
                    },
                    required: false
                }
            ],

        }
    )
}

exports.getNewProducts = async () => {

    return await product.findAll(
        {
            where: {
                [PARAMS.isDeleted]: false,
                [PARAMS.isActive]: true

            },
            attributes: [...productAttributes, PARAMS.createdAt],
            include: [
                {
                    model: category_,
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
                {
                    model: productDiscount,
                    where: {
                        [Op.and]: [
                            { [PARAMS.startDate]: { [Op.lt]: new Date() } },
                            { [PARAMS.endDate]: { [Op.gte]: new Date() } }
                        ]
                    },
                    required: false
                }
            ],
            order: [[PARAMS.createdAt, "DESC"]],
            limit: 10
        }

    )
}

exports.addDiscountToProductRecord = async (data) => {
    return await productDiscount.create(data)
}


exports.deleteDiscountToProductRecord = async (productId) => {
    return await productDiscount.destroy({ where: { productId } })
}

// exports.getProductsByCategoryTree = async (categoryUid, page = 1, pageSize = 20) => {
//     // Recursive CTE to get all descendant categories
//     const offset = (page - 1) * pageSize;
//     const replacements = { categoryUid, limit: pageSize, offset };

//     const [results] = await conn.query(`
//         WITH RECURSIVE category_tree AS (
//             SELECT uid FROM ${MODEL_NAMES.category} WHERE uid = :categoryUid
//             UNION ALL
//             SELECT c.uid FROM ${MODEL_NAMES.category} c
//             INNER JOIN category_tree ct ON c.parentId = ct.uid
//         )
//         SELECT p.* FROM ${MODEL_NAMES.product} p
//         WHERE p.categoryId IN (SELECT uid FROM category_tree)
//         LIMIT :limit OFFSET :offset
//     `, { replacements, model: product, mapToModel: true });

//     return results;
// }



// Helper to get all descendant category UIDs (recursive CTE)
async function getAllCategoryUids(categoryUid) {
    const [rows] = await conn.query(`
        WITH RECURSIVE category_tree AS (
            SELECT uid FROM ${MODEL_NAMES.category} WHERE uid = :categoryUid
            UNION ALL
            SELECT c.uid FROM ${MODEL_NAMES.category} c
            INNER JOIN category_tree ct ON c.parentId = ct.uid
        )
        SELECT uid FROM category_tree
    `, { replacements: { categoryUid } });
    return rows.map(r => r.uid);
}

exports.getProductsByCategoryTree = async (categoryUid, product_query, offset = 0, limit = 20) => {
    const categoryUids = await getAllCategoryUids(categoryUid);

    return await product.findAll({
        where: {
            categoryId: { [Op.in]: categoryUids },
            [PARAMS.isDeleted]: false,
            [PARAMS.isActive]: true,
            ...product_query
        },
        attributes: productAttributes,
        include: [
            {
                model: category_,
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
            {
                model: productDiscount,
                where: {
                    [Op.and]: [
                        { [PARAMS.startDate]: { [Op.lt]: new Date() } },
                        { [PARAMS.endDate]: { [Op.gte]: new Date() } }
                    ]
                },
                required: false
            }
        ],
        offset,
        limit
    });
};
