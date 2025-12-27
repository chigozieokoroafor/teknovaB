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
    },
    [PARAMS.parentId]:{
        type: DataTypes.STRING(255),
        allowNull: true
    },
    [PARAMS.sortOrder]: {
        type: DataTypes.INTEGER,
        allowNull: true,
        // field: 'sort_order'
    }
}, {
    tableName: MODEL_NAMES.category,
    modelName: MODEL_NAMES.category,
}
)

// const subCategory = conn.define(MODEL_NAMES.subCategory, {
//     id: {
//         type: DataTypes.INTEGER,
//         unique: true,
//         autoIncrement: true,
//         primaryKey: true
//     },
//     uid: {
//         type: DataTypes.STRING(255),
//         allowNull: false,
//         unique: true,
//         defaultValue: () => createUUID()
//     },
//     categoryId: {
//         type: DataTypes.STRING(),
//         allowNull: false
//     },
//     name: {
//         type: DataTypes.STRING(255),
//         allowNull: true
//     },
//     imageId: {
//         type: DataTypes.INTEGER
//     },
// }, {
//     tableName: MODEL_NAMES.subCategory,
//     modelName: MODEL_NAMES.subCategory,
// })


module.exports = {
    category,
    // subCategory
}