
const { Op } = require("sequelize");
const { PARAMS, RELATIONSHIP_NAMES } = require("../../util/consts");
const { category_, images, cart } = require("../models/relationships");
const { conn } = require("../base");

exports.createCategoryQuery = async (data) => {
    return await category_.create(
        data
        
    )
}

exports.checkCategoryExists = async (searchKeyword) => {
    return await category_.findOne(
        {
            where: {
                [PARAMS.name]: {
                    [Op.like]: `%${searchKeyword}%`
                }
            }
        }
    )
}

exports.fetchCategoryQuery = async (limit, skip) => {
    return await category_.findAll(
        {
            attributes: [PARAMS.uid, PARAMS.name, PARAMS.category_specifications, PARAMS.sortOrder],
            include: [
                {
                    model: images,
                    as: RELATIONSHIP_NAMES.image,
                    attributes: [PARAMS.id, PARAMS.img_url]
                },
                {
                    model: category_,
                    attributes:[PARAMS.uid, PARAMS.name, PARAMS.category_specifications],
                    as: RELATIONSHIP_NAMES.subCategories
                }
            ],
            limit: limit,
            offset: skip,

            // order: [
            //     [conn.literal("sortOrder IS NULL"), "ASC"],
            //     [PARAMS.sortOrder, "ASC"]
            // ],
            
        }
    )
}

exports.fetchCategoryById = async (uid) => {
    return await category_.findOne({
        where: { uid }
    })
}

exports.fetchSingleCartItem = async (uid, cartId) => {
    return await cart.findOne(
        {
            where: {
                id: cartId,
                uid: uid
            }
        }
    )
}

exports.destroyCartItem = async (uid, cartId) => {
    return await cart.destroy(
        {
            where:{
                id: cartId,
                uid: uid
            }
            
        }
    )
}

exports.deleteCategory = async (categoryId) => {
    await category_.destroy({ where: { uid: categoryId } })
}

exports.updateSpecificCategory = async (categoryId, update) => {
    return await category_.update(update, { where: { uid: categoryId } })
}

exports.updateDifferentCategory = async (where, update) => {
    return await category_.update(update, { where: {...where} })
}