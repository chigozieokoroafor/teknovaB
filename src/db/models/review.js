const { DataTypes } = require("sequelize");
const { MODEL_NAMES } = require("../../util/consts");
const { conn } = require("../base");

const extra_payments = conn.define(MODEL_NAMES.extra_payments, {
    id:{
        type:DataTypes.INTEGER,
        unique:true,
        autoIncrement:true,
        primaryKey:true
    }, 
    
    name:{
        type: DataTypes.STRING(255),
        allowNull:true
    },
    price: {
        type: DataTypes.DOUBLE,
        allowNull: true
    }
}, {
    tableName:MODEL_NAMES.extra_payments,
    modelName:MODEL_NAMES.extra_payments,
    timestamps: false
})

module.exports = {
    extra_payments
}