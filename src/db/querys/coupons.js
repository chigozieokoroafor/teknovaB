
const { PARAMS } = require("../../util/consts");
const { coupon } = require("../models/relationships");


const attributes = [PARAMS.id, PARAMS.name, PARAMS.code, PARAMS.coupon_type, PARAMS.discount_type, PARAMS.discount_value, PARAMS.startDate, PARAMS.endDate, PARAMS.usage, PARAMS.limit, PARAMS.createdAt,  PARAMS.category_list, PARAMS.product_list, PARAMS.status]
async function createCouponRecord (data){
    return await coupon.create(data)
}

async function fetchCouponRecord ( limit, offset){
    return await coupon.findAll({
        where: {
            deletedAt: null
        },
        attributes,
        limit,
        offset,
        order: [[PARAMS.status, "ASC"],[PARAMS.createdAt, "DESC"]]
    })
}

async function fetchSingleCouponRecord ( query){
    query.deletedAt = null
    return await coupon.findOne({
        where: query,
        attributes
    })
}

async function deleteSingleCouponRecord(id){
    return await coupon.update({deletedAt: new Date()},{
        where: {id}
    })
}

async function updateSingleCouponRecord(id, update){
    return await coupon.update(update,{
        where: {id}
    })
}

module.exports ={
    createCouponRecord,
    fetchCouponRecord,
    deleteSingleCouponRecord,
    fetchSingleCouponRecord,
    updateSingleCouponRecord
}