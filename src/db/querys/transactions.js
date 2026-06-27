const { prisma } = require("../base");

exports.uploadTransaction = async (data) => {
    return prisma.transactions.create({
        data
    });
};

exports.fetchTransactions = async (limit, offset) => {
    return prisma.transactions.findMany({
        where: {
            status: {
                not: {
                    contains: "pending"
                }
            }
        },
        select: {
            reference: true,
            amount: true,
            status: true,
            createdAt: true,
            customer: {
                select: {
                    uid: true,
                    name: true
                }
            }
        },
        take: limit,
        skip: offset
    });
};

exports.updateTransaction = async (update, orderId) => {
    return prisma.transactions.updateMany({
        where: { orderId },
        data: update
    });
};

exports.getRevenue = async () => {
    const aggregate = await prisma.transactions.aggregate({
        _sum: {
            amount: true
        },
        where: {
            status: "Success"
        }
    });

    return [
        {
            revenue_sum: aggregate._sum.amount || 0
        }
    ];
};