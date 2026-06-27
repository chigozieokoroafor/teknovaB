const { prisma } = require("../base");
const { buildPrismaWhere } = require("../../util/prismaHelper");

const selectAttributes = {
    id: true,
    name: true,
    code: true,
    coupon_type: true,
    discount_type: true,
    discount_value: true,
    startDate: true,
    endDate: true,
    usage: true,
    limit: true,
    createdAt: true,
    category_list: true,
    product_list: true,
    status: true
};

async function createCouponRecord(data) {
    return prisma.coupon.create({
        data
    });
}

async function fetchCouponRecord(query, limit, offset) {
    const where = buildPrismaWhere(query);
    where.deletedAt = null;

    return prisma.coupon.findMany({
        where,
        select: selectAttributes,
        take: limit,
        skip: offset,
        orderBy: [
            { status: 'asc' },
            { createdAt: 'desc' }
        ]
    });
}

async function fetchSingleCouponRecord(query) {
    // const where = buildPrismaWhere(query);
    query.deletedAt = null;

    return prisma.coupon.findFirst({
        where: query,
        select: selectAttributes
    });
}

async function deleteSingleCouponRecord(id) {
    return prisma.coupon.update({
        where: { id: Number(id) },
        data: { deletedAt: new Date() }
    });
}

async function updateSingleCouponRecord(id, update) {
    return prisma.coupon.update({
        where: { id: Number(id) },
        data: update
    });
}

module.exports = {
    createCouponRecord,
    fetchCouponRecord,
    deleteSingleCouponRecord,
    fetchSingleCouponRecord,
    updateSingleCouponRecord
}