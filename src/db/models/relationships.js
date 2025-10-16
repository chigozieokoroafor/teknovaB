const { PARAMS, RELATIONSHIP_NAMES } = require("../../util/consts");
const { transaction } = require("./transaction");
const { user } = require("./user");
const { images, product_images } = require("./images");
// const {category} = require("./category")
const { product, coupon } = require("./product");
const { cart } = require("./cart");
const { order } = require("./order");
const { category } = require("teknovab/src/db/models/category");



user.hasMany(transaction, { foreignKey: PARAMS.uid, sourceKey: PARAMS.uid, as: RELATIONSHIP_NAMES.transaction })
transaction.belongsTo(user, { foreignKey: PARAMS.uid, targetKey: PARAMS.uid, as: RELATIONSHIP_NAMES.customer })

category.belongsTo(images, { foreignKey: PARAMS.imageId, targetKey: PARAMS.id, as: RELATIONSHIP_NAMES.image })

product_images.belongsTo(images, { foreignKey: PARAMS.imageId, targetKey: PARAMS.id, as: RELATIONSHIP_NAMES.image })

product.belongsTo(category, {
    foreignKey: PARAMS.categoryId, targetKey: PARAMS.uid
    , as: RELATIONSHIP_NAMES.category
})

category.hasMany(product, {
    foreignKey: PARAMS.categoryId, sourceKey: PARAMS.uid
    , as: RELATIONSHIP_NAMES.product
})

product.hasMany(cart, { foreignKey: PARAMS.productId, sourceKey: PARAMS.uid })
cart.belongsTo(product, { foreignKey: PARAMS.productId, targetKey: PARAMS.uid })

product.hasMany(product_images, { foreignKey: PARAMS.productId, sourceKey: PARAMS.uid })

product_images.belongsTo(product, { foreignKey: PARAMS.productId, targetKey: PARAMS.uid })

order.hasMany(cart, { foreignKey: PARAMS.orderId, sourceKey: PARAMS.orderId })
cart.belongsTo(order, { foreignKey: PARAMS.orderId, targetKey: PARAMS.orderId })

order.hasOne(transaction, { foreignKey: PARAMS.orderId, sourceKey: PARAMS.orderId })
transaction.belongsTo(order, { foreignKey: PARAMS.orderId, targetKey: PARAMS.orderId })

order.belongsTo(user, { foreignKey: PARAMS.uid, targetKey: PARAMS.uid })
user.hasMany(order, { foreignKey: PARAMS.uid, sourceKey: PARAMS.uid })


module.exports = {
    transaction,
    user,
    images,
    category,
    product,
    cart,
    coupon,
    product_images,
    order
}