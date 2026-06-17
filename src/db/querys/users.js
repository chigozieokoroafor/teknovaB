const { prisma } = require("../base");

exports.checkUserExists = async (email) => {
    return prisma.user.findFirst({
        where: { email },
        select: { id: true }
    });
};

exports.getUserByEmail = async (email) => {
    return prisma.user.findFirst({
        where: { email }
    });
};

exports.createUserAccount = async (body) => {
    return prisma.user.create({
        data: body
    });
};

exports.verifyUser = async (uid) => {
    return prisma.user.update({
        where: { uid },
        data: { isVerified: true }
    });
};

exports.fetchUserForMiddleware = async (uid) => {
    return prisma.user.findUnique({
        where: { uid },
        select: {
            email: true,
            uid: true,
            billing_address: true,
            shipping_address: true
        }
    });
};

exports.countUsers = async () => {
    return prisma.user.count({
        where: {
            isVerified: true
        }
    });
};