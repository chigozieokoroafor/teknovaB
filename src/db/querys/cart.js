const { Op, fn, col, literal } = require("sequelize");
const { PARAMS, RELATIONSHIP_NAMES, STATUSES } = require("../../util/consts");
// const { cart } = require("../models/cart");
// const { product_images, images } = require("../models/images");
// const { product } = require("../models/product");
const { order, user, transaction, product, images, product_images, cart } = require("../models/relationships")

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

exports.fetchOrdersForClient = async (uid, limit, offset) => {
    return await order.findAll(
        {
            where: {
                uid,
                [PARAMS.paymentStatus]: {
                    [Op.not]: STATUSES.pending
                }
            },
            include: {
                model: cart
            },
            limit,
            offset
        }
    )
}

exports.fetchAllOrders = async (limit, offset) => {
    return await order.findAll(
        {
            include: [
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

exports.updateOrderStatus = async (orderId, status) => {
    return await order.update({ status }, { where: { orderId } })
}

exports.getSpecificOrder = async (orderId) => {
    return await order.findOne(
        {
            where: { orderId },
            include: {
                model: user,
                attributes: [PARAMS.name, PARAMS.email]
            }
        }
    )
}


exports.getTopProductCounts = async () => {
  return await cart.findAll({
    where: {
      [PARAMS.ordered]: true
    },
    attributes: [
      PARAMS.productId,
      [fn('COUNT', col(PARAMS.productId)), 'count'],   // count actual product rows
      [fn('SUM', col(PARAMS.units)), 'totalUnitSold'],
    ],
    include: [
      {
        model: product,
        attributes: [PARAMS.name, PARAMS.price],
        include: [
          {
            model: product_images,
            // as: RELATIONSHIP_NAMES.defaultImage,
            attributes: [PARAMS.imageId],
            include: [
              {
                model: images,
                attributes: [PARAMS.img_url],
                as: RELATIONSHIP_NAMES.image
              }
            ]
          }
        ]
      }
    ],
    group: [
      PARAMS.productId,
    ],
    limit: 5,
    order: [[literal("totalUnitSold"), "DESC"]]
  });
};
