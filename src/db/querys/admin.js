const { prisma } = require("../base");

exports.checkAdmin = async (uid) => {
    return prisma.admin.findUnique({
        where: { uid }
    });
};