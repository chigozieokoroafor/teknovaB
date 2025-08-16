const { PARAMS, RELATIONSHIP_NAMES } = require("../../util/consts");
const { transaction } = require("./transaction");
const { user } = require("./user");
const { images } = require("./images");
const { category, category_specifications } = require("./category");
// const { product } = require("./product")

user.hasMany(transaction, { foreignKey: PARAMS.uid, sourceKey: PARAMS.uid, as: RELATIONSHIP_NAMES.transaction })
transaction.belongsTo(user, { foreignKey: PARAMS.uid, targetKey: PARAMS.uid, as: RELATIONSHIP_NAMES.customer })

category.belongsTo(images,{foreignKey: PARAMS.imageId, targetKey: PARAMS.id, as: RELATIONSHIP_NAMES.image} )

category.hasMany(category_specifications, {foreignKey: PARAMS.categoryId, sourceKey: PARAMS.uid, as: RELATIONSHIP_NAMES.category_specifications})

// product.hasMany(images, {foreignKey: })

module.exports = {
    transaction,
    user,
    images,
    category,
    category_specifications
}