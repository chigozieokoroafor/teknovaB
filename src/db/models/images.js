const { DataTypes } = require("sequelize");
const { MODEL_NAMES, PARAMS } = require("../../util/consts");
const { conn } = require("../base");

const images = conn.define(MODEL_NAMES.images, {
    [PARAMS.id]:{
        type:DataTypes.INTEGER,
        unique:true,
        autoIncrement:true,
        primaryKey:true
    }, 
    [PARAMS.img_url]:{
        type:DataTypes.TEXT("long")
    },
    [PARAMS.fileType]:{
        type:DataTypes.STRING(255),
        allowNull:true
    },

    
}, {
    tableName:MODEL_NAMES.images,
    modelName:MODEL_NAMES.images
})

const product_images = conn.define(MODEL_NAMES.product_images, {
    [PARAMS.id]:{
        type:DataTypes.INTEGER,
        unique:true,
        autoIncrement:true,
        primaryKey:true
    },
    [PARAMS.productId]: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    [PARAMS.imageId]: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
})


module.exports = {
    images,
    product_images
}