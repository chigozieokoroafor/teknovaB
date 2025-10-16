const { DataTypes } = require("sequelize");
const { MODEL_NAMES, PARAMS } = require("../../util/consts");
const { conn } = require("../base");
const { createUUID } = require("../../util/base");

const category = conn.define(MODEL_NAMES.category, {
    id: {
        type: DataTypes.INTEGER,
        unique: true,
        autoIncrement: true,
        primaryKey: true
    },
    uid: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        defaultValue: () => createUUID()
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    imageId: {
        type: DataTypes.INTEGER
    },
    [PARAMS.category_specifications]: {
        type: DataTypes.JSON
    }
}, {
    tableName: MODEL_NAMES.category,
    modelName: MODEL_NAMES.category,
}
)


module.exports = {
    category
}