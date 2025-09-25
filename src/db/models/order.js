const { DataTypes } = require("sequelize");
const { MODEL_NAMES, STATUSES, PARAMS } = require("../../util/consts");
const { conn } = require("../base");

const order = conn.define(MODEL_NAMES.order, {
    id:{
        type:DataTypes.INTEGER,
        unique:true,
        autoIncrement:true,
        primaryKey:true
    }, 
    uid:{
        type:DataTypes.STRING(40),
    },
    orderId:{
        type:DataTypes.STRING(255),
        unique: true
    },
    status:{ // delivered or not
        type: DataTypes.STRING(255),
        allowNull:false,
        defaultValue:STATUSES.pending
    },
    paymentStatus:{ //status of payment
        type: DataTypes.STRING(255),
        allowNull:false,
        defaultValue:STATUSES.pending
    },
    [PARAMS.contact_Info]: {
        type: DataTypes.JSON
    },
    [PARAMS.billing_address]: {
        type: DataTypes.JSON
    },
    [PARAMS.deliveryType]:{
        type: DataTypes.STRING(50),
        defaultValue: "Pick-up"
    },
    [PARAMS.deliveryCost]:{
        type: DataTypes.DOUBLE,
        defaultValue: 0
    }
}, {
    tableName:MODEL_NAMES.order,
    modelName:MODEL_NAMES.order,
    timestamps: true
})

module.exports = {
    order
}