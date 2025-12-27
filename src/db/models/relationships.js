const { PARAMS, RELATIONSHIP_NAMES } = require("../../util/consts");
const { transaction } = require("./transaction");
const { user } = require("./user");
const { images, product_images } = require("./images");
const { product, coupon, productDiscount, category_ } = require("./product");
const { cart } = require("./cart");
const { order } = require("./order");


user.hasMany(transaction, { foreignKey: PARAMS.uid, sourceKey: PARAMS.uid, as: RELATIONSHIP_NAMES.transaction })
transaction.belongsTo(user, { foreignKey: PARAMS.uid, targetKey: PARAMS.uid, as: RELATIONSHIP_NAMES.customer })

category_.belongsTo(images, { foreignKey: PARAMS.imageId, targetKey: PARAMS.id, as: RELATIONSHIP_NAMES.image })

product_images.belongsTo(images, { foreignKey: PARAMS.imageId, targetKey: PARAMS.id, as: RELATIONSHIP_NAMES.image })

product.hasOne(productDiscount, { foreignKey: PARAMS.productId, sourceKey: PARAMS.uid })

product.belongsTo(category_
    , {
        foreignKey: PARAMS.categoryId, targetKey: PARAMS.uid
        , as: RELATIONSHIP_NAMES.category
    })

category_.hasMany(product, {
    foreignKey: PARAMS.categoryId, sourceKey: PARAMS.uid
    , as: RELATIONSHIP_NAMES.product
})

category_.hasMany(category_, {foreignKey: PARAMS.parentId, sourceKey: PARAMS.uid, as: RELATIONSHIP_NAMES.subCategories})
category_.belongsTo(category_, {foreignKey: PARAMS.parentId, targetKey: PARAMS.uid, as: RELATIONSHIP_NAMES.parentCategory})

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
    category_,
    product,
    cart,
    coupon,
    product_images,
    productDiscount,
    order
}