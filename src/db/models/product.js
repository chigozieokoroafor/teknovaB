require("dotenv").config()


const { DataTypes } = require("sequelize");
const { MODEL_NAMES, PARAMS } = require("../../util/consts");
const { conn } = require("../base");
const { createUUID } = require("../../util/base");


const product = conn.define(MODEL_NAMES.product, {
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
        defaultValue: () => "PRD-" + createUUID()
    },
    categoryId: {
        type: DataTypes.STRING(255),
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: true
    },

    // discount: {
    //     type: DataTypes.DOUBLE,
    //     defaultValue: 0.0
    // },
    // discountExpiry:{
    //     type:DataTypes.DATE,
    //     allowNull:true
    // },
    price: {
        type: DataTypes.DOUBLE
    },
    description: {
        type: DataTypes.TEXT("long"),
        allowNull: true
    },
    units: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    isDeleted:{
        type:DataTypes.BOOLEAN,
        defaultValue:false
    }


}, {
    tableName: MODEL_NAMES.product,
    modelName: MODEL_NAMES.product,
    indexes:[
        {
            type: 'FULLTEXT',
            name: "product_text_idx",
            fields: [PARAMS.name]
        },
    ]
})

const product_specifications = conn.define(MODEL_NAMES.product_specifications, {
    [PARAMS.id]:{
        type: DataTypes.INTEGER,
        unique: true,
        autoIncrement: true,
        primaryKey: true
    },
    [PARAMS.productId]:{
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
    tableName: MODEL_NAMES.product_specifications,
    modelName: MODEL_NAMES.product_specifications,
})

module.exports = {
    product,
    product_specifications
}