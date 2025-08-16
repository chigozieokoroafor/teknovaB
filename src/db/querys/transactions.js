const { Sequelize } = require("sequelize");
const { PARAMS, RELATIONSHIP_NAMES, MODEL_NAMES } = require("../../util/consts");
const { transaction, user } = require("../models/relationships");

exports.uploadTransaction = async (data )=>{
    await transaction.create(data)
}

exports.fetchTransactions = async(limit, offset) =>{
    return await transaction.findAll(
        {
            attributes:[PARAMS.reference, PARAMS.amount, PARAMS.status, PARAMS.createdAt],
            include: [
                {
                    model: user,
                    attributes: [PARAMS.uid, PARAMS.name],
                    as: RELATIONSHIP_NAMES.customer
                }
            ],
            limit,
            offset
        }
    )
}

exports.updateTransaction = async(update, orderId) =>{
    await transaction.update(update, {
        where:{
            [PARAMS.orderId]:orderId
        }
    })
}

exports.getRevenue = async () => {
    return await transaction.findAll(
        {
            where: {
                // agencyId: agencyId,
                status: "Success",
                // serviceType:"serviceType"
            },
            attributes: [
                
                [Sequelize.fn('SUM', Sequelize.col(`${MODEL_NAMES.transaction}.amount`)), 'revenue_sum'],
            ],
            raw:true
        }
    )
}