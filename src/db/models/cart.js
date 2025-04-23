const { DataTypes } = require("sequelize");
const { MODEL_NAMES, STATUSES } = require("../../util/consts");
const { conn } = require("../base");

const cart = conn.define(MODEL_NAMES.cart, {
    id:{
        type:DataTypes.INTEGER,
        unique:true,
        autoIncrement:true,
        primaryKey:true
    }, 
    productId:{
        type:DataTypes.STRING(40),
        unique:true
    },
    unit_purchased:{
        type: DataTypes.STRING(255),
        allowNull:true
    }
}, {
    tableName:MODEL_NAMES.cart,
    modelName:MODEL_NAMES.cart
})

module.exports = {
    cart
}