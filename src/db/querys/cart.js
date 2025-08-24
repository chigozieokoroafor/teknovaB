const { Op } = require("sequelize");
const { PARAMS, RELATIONSHIP_NAMES, STATUSES } = require("../../util/consts");
const { cart } = require("../models/cart");
const { product_images, images } = require("../models/images");
const { product } = require("../models/product");
const { order, user, transaction } = require("../models/relationships")

exports.addToCartQuery = async (data) => {
    return await cart.create(data)
}

exports.fetchCartItems = async (uid, offset, limit) => {
    return await cart.findAll(
        {
            where: {
                uid,
                [PARAMS.ordered]: false

            },
            include: [
                {
                    model: product,
                    attributes: [PARAMS.uid, PARAMS.name],
                    include: {
                        model: product_images,
                        attributes: [PARAMS.id, PARAMS.imageId],
                        include: {
                            model: images,
                            attributes: [PARAMS.img_url],
                            as: RELATIONSHIP_NAMES.image
                        }
                    },
                }
            ],
            offset,
            limit
        }
    )
}

exports.fetchCartItemsToOrder = async (uid) => {
    return await cart.findAll(
        {
            where: {
                uid,
                [PARAMS.ordered]: false

            },
            attributes: [PARAMS.id, PARAMS.total_amount]
        }
    )
}

exports.updateCartItemsforOrder = async (update, where) => {
    await cart.update(update, { where: where })
}

exports.countOrders = async () => {
    return await cart.count(
        {
            where: {
                [PARAMS.ordered]: true
            }

        }
    )
}

exports.createOrderOnOrderTable = async (data) => {
    await order.create(data)
}

exports.fetchOrdersForClient = async(uid, limit, offset) =>{
    return await order.findAll(
        {
            where: {
                uid,
                [PARAMS.paymentStatus]: {
                    [Op.not]: STATUSES.pending
                }
            },
            include:{
                model: cart
            },
            limit,
            offset
        }
    )
}

exports.fetchAllOrders = async(limit, offset) =>{
    return await order.findAll(
        {
            include:[
                {
                    model: user,
                    attributes: [PARAMS.name, PARAMS.email]
                },
                {
                    model: transaction,
                    attributes: [PARAMS.amount]
                }
            ],
            limit,
            offset
        }
    )
}