const { DataTypes } = require("sequelize");
const { MODEL_NAMES } = require("../../util/consts");
const { conn } = require("../base");

const product = conn.define(MODEL_NAMES.product, {
    id: {
        type: DataTypes.INTEGER,
        unique: true,
        autoIncrement: true,
        primaryKey: true
    },
    categoryId: {
        type: DataTypes.INTEGER,
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: true
    },

    discount: {
        type: DataTypes.DOUBLE,
        defaultValue: 0.0
    },

    price: {
        type: DataTypes.DOUBLE
    },

    colors: {
        type: DataTypes.JSON,
    },

    description: {
        type: DataTypes.TEXT("long"),
        allowNull: true
    },

    units: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },

    specifications:{
        type: DataTypes.JSON,
        allowNull:true
    }


}, {
    tableName: MODEL_NAMES.product,
    modelName: MODEL_NAMES.product
})

module.exports = {
    product
}