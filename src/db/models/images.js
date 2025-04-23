const { DataTypes } = require("sequelize");
const { MODEL_NAMES } = require("../../util/consts");
const { conn } = require("../base");

const images = conn.define(MODEL_NAMES.images, {
    id:{
        type:DataTypes.INTEGER,
        unique:true,
        autoIncrement:true,
        primaryKey:true
    }, 
    categoryId:{
        type:DataTypes.STRING(40),
        allowNull:true
    },
    productId:{
        type: DataTypes.INTEGER,
        allowNull:true
    },
    blob:{
        type: DataTypes.BLOB("long"),
        allowNull:false
    },
    type:{
        type:DataTypes.STRING(255),
        allowNull:true
    }
    
}, {
    tableName:MODEL_NAMES.images,
    modelName:MODEL_NAMES.images
})

module.exports = {
    images
}