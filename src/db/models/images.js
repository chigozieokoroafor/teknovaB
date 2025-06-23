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
    // [PARAMS.uid]:{
    //     type:DataTypes.STRING(255),
    //     defaultValue:
    //     allowNull:false,

    // },
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

module.exports = {
    images
}