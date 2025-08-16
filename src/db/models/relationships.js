const { PARAMS, RELATIONSHIP_NAMES } = require("../../util/consts");
const { transaction } = require("./transaction");
const { user } = require("./user");
const { images } = require("./images")
// const { product } = require("./product")

user.hasMany(transaction, { foreignKey: PARAMS.uid, sourceKey: PARAMS.uid, as: RELATIONSHIP_NAMES.transaction })
transaction.belongsTo(user, { foreignKey: PARAMS.uid, targetKey: PARAMS.uid, as: RELATIONSHIP_NAMES.customer })

// product.hasMany(images, {foreignKey: })

module.exports = {
    transaction,
    user,
    images
}