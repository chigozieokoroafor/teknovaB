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
    },

    [MODEL_NAMES.product_specifications]:{
        type: DataTypes.JSON
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

const coupon = conn.define(MODEL_NAMES.coupon, {
    id: {
        type: DataTypes.INTEGER,
        unique: true,
        autoIncrement: true,
        primaryKey: true
    },
    code:{
        type:DataTypes.STRING(50),
        allowNull:false
    },
    name:{
        type: DataTypes.TEXT("medium"),
        allowNull: false
    },
    coupon_type:{ //product, category, order, shipping
        type:DataTypes.STRING(20),
        allowNull:false
    },
    product_list : {
        type: DataTypes.JSON,
    },
    category_list: {
        type: DataTypes.JSON
    },

    discount_value:{
        type: DataTypes.DOUBLE,
        allowNull:false
    },
    discount_type:{ //percentage / fixed
        type: DataTypes.STRING(50),
        allowNull: false
    },
    startDate:{
        type: DataTypes.DATE,
        allowNull:true
    },
    endDate:{
        type: DataTypes.DATE,
        allowNull:true
    },
    limit:{
        type: DataTypes.INTEGER,
        allowNull:false
    },
    usage:{
        type: DataTypes.INTEGER,
        defaultValue:0
    },
    status:{
        type:DataTypes.STRING(20),
        defaultValue:"Active"
    },
    deletedAt: {
        type: DataTypes.DATE
    }
})


module.exports = {
    product,
    coupon
}