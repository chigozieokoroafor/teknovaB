const { DataTypes } = require("sequelize");
const { MODEL_NAMES, PARAMS } = require("../../util/consts");
const { conn } = require("../base");
const { createUUID } = require("../../util/base");

const category = conn.define(MODEL_NAMES.user, {
    id: {
        type: DataTypes.INTEGER,
        unique: true,
        autoIncrement: true,
        primaryKey: true
    },
    uid:{
        type:DataTypes.STRING(255),
        allowNull:false,
        unique:true,
        defaultValue: () => createUUID()
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    imageId: {
        type: DataTypes.INTEGER,
    }
}, {
    tableName: MODEL_NAMES.category,
    modelName: MODEL_NAMES.category,
}
)

const category_specifications = conn.define(MODEL_NAMES.category_specifications, {
    [PARAMS.id]:{
        type: DataTypes.INTEGER,
        unique: true,
        autoIncrement: true,
        primaryKey: true
    },
    [PARAMS.categoryId]:{
        type:DataTypes.STRING(255),
        allowNull:false
    },
    [PARAMS.name]:{
        type:DataTypes.STRING(255),
        allowNull:false
    },
    [PARAMS.values]:{
        type:DataTypes.JSON,
        allowNull:false,
        // defaultValue:0
    }
}, {
    tableName: MODEL_NAMES.category_specifications,
    modelName: MODEL_NAMES.category_specifications,
})

module.exports = {
    category,
    category_specifications
}