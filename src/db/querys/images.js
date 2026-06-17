const { prisma } = require("../base");

exports.uploadBulkImages = async (data) => {
    // Note: createMany is supported on MySQL and returns { count: number }
    return prisma.images.createMany({
        data
    });
};

exports.fetchImages = async (limit, offset) => {
    return prisma.images.findMany({
        take: limit,
        skip: offset
    });
};

exports.countAllImages = async () => {
    return prisma.images.count();
};

exports.fetchSingleImage = async (id) => {
    return prisma.images.findUnique({
        where: { id: Number(id) }
    });
};

exports.deleteImage = async (id) => {
    return prisma.images.delete({
        where: { id: Number(id) }
    });
};