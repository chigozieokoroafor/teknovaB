const { DataTypes } = require("sequelize");
const { MODEL_NAMES } = require("../../util/consts");
const { conn } = require("../base");

const category = conn.define(MODEL_NAMES.user, {
    id: {
        type: DataTypes.INTEGER,
        unique: true,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    img_url: {
        type: DataTypes.STRING(255),
        allowNull: true
    }
}, {
    tableName: MODEL_NAMES.category,
    modelName: MODEL_NAMES.category
})

module.exports = {
    category
}