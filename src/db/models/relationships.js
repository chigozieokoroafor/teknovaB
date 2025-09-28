const { PARAMS, RELATIONSHIP_NAMES } = require("../../util/consts");
const { transaction } = require("./transaction");
const { user } = require("./user");
const { images, product_images } = require("./images");
const { category,
    // category_specifications 
} = require("./category");
const { product, product_specifications } = require("./product");
const { cart } = require("./cart");
const { order } = require("./order")
// const { product } = require("./product")

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


// category.hasMany(category_specifications, { foreignKey: PARAMS.categoryId, sourceKey: PARAMS.uid, as: RELATIONSHIP_NAMES.category_specifications })

// product_specifications.belongsTo(product, { foreignKey: PARAMS.productId, targetKey: PARAMS.uid })
// product.hasMany(product_specifications, { foreignKey: PARAMS.productId, sourceKey: PARAMS.uid })

product.hasMany(cart, { foreignKey: PARAMS.productId, sourceKey: PARAMS.uid })
cart.belongsTo(product, { foreignKey: PARAMS.productId, targetKey: PARAMS.uid })

product.hasMany(product_images, { foreignKey: PARAMS.productId, sourceKey: PARAMS.uid })

// product.hasOne(product_images, {
//     as: RELATIONSHIP_NAMES.defaultImage,
//     foreignKey: PARAMS.productId,
//     sourceKey: PARAMS.uid,
// });

product_images.belongsTo(product, { foreignKey: PARAMS.productId, targetKey: PARAMS.uid })

order.hasMany(cart, { foreignKey: PARAMS.orderId, sourceKey: PARAMS.orderId })
cart.belongsTo(order, { foreignKey: PARAMS.orderId, targetKey: PARAMS.orderId })

order.hasOne(transaction, { foreignKey: PARAMS.orderId, sourceKey: PARAMS.orderId })
transaction.belongsTo(transaction, { foreignKey: PARAMS.orderId, targetKey: PARAMS.orderId })

order.belongsTo(user, { foreignKey: PARAMS.uid, targetKey: PARAMS.uid })
user.hasMany(order, { foreignKey: PARAMS.uid, sourceKey: PARAMS.uid })


module.exports = {
    transaction,
    user,
    images,
    category,
    // category_specifications,
    product,
    cart,
    // product_specifications,
    product_images,
    order
}