const { DataTypes } = require("sequelize");
const { MODEL_NAMES } = require("../../util/consts");
const { conn } = require("../base");

const product = conn.define(MODEL_NAMES.user, {
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
    tableName: MODEL_NAMES.user,
    modelName: MODEL_NAMES.user
})

module.exports = {
    product
}