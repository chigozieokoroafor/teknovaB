
const { Op } = require("sequelize");
const { PARAMS, RELATIONSHIP_NAMES } = require("../../util/consts");
const { category, images, cart } = require("../models/relationships");

exports.createCategoryQuery = async (data) => {
    return await category.create(
        data
        // {name, img_blob}
    )
}

exports.checkCategoryExists = async (searchKeyword) => {
    return await category.findOne(
        {
            where: {
                [PARAMS.name]: {
                    [Op.like]: `%${searchKeyword}%`
                }
            }
        }
    )
}

exports.fetchCategoryQuery = async () => {
    return await category.findAll(
        {
            attributes: [PARAMS.uid, PARAMS.name, PARAMS.category_specifications],
            include: [
                {
                    model: images,
                    as: RELATIONSHIP_NAMES.image,
                    attributes: [PARAMS.id, PARAMS.img_url]
                },
                // {
                //     model: category_specifications,
                //     attributes:[PARAMS.id, PARAMS.name, PARAMS.values],
                //     as: RELATIONSHIP_NAMES.category_specifications
                // }
            ]
        }
    )
}

exports.fetchCategoryById = async (uid) => {
    return await category.findOne({
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
    await category.destroy({ where: { uid: categoryId } })
}

exports.updateSpecificCategory = async (categoryId, update) => {
    return await category.update(update, { where: { uid: categoryId } })
}