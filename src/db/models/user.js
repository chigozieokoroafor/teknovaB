const { DataTypes } = require("sequelize");
const { MODEL_NAMES } = require("../../util/consts");
const { conn } = require("../base");

const user = conn.define(MODEL_NAMES.user, {
    id:{
        type:DataTypes.INTEGER,
        unique:true,
        autoIncrement:true,
        primaryKey:true
    }, 
    uid:{
        type:DataTypes.STRING(40),
        unique:true
    },
    name:{
        type: DataTypes.STRING(255),
        allowNull:true
    },
    username:{
        type: DataTypes.STRING(255),
        allowNull:true
    },
    email:{
        type: DataTypes.STRING(255),
        allowNull:true,
        validate:{
            isEmail:true
        }
    },
    password:{
        type:DataTypes.TEXT("long")
    },
    isVerified:{
        type:DataTypes.BOOLEAN,
        defaultValue:false
    },
    billing_address:{
        type: DataTypes.TEXT("long"),
        allowNull:true
    },
    shipping_address:{
        type: DataTypes.TEXT("long"),
        allowNull:true 
    }  
}, {
    tableName:MODEL_NAMES.user,
    modelName:MODEL_NAMES.user
})

module.exports = {
    user
}