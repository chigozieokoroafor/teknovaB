const { prisma } = require("../base");
const { buildPrismaWhere } = require("../../util/prismaHelper");

exports.createCategoryQuery = async (data) => {
    return prisma.category.create({
        data
    });
};

exports.checkCategoryExists = async (searchKeyword) => {
    return prisma.category.findFirst({
        where: {
            name: {
                contains: searchKeyword
            }
        }
    });
};

exports.fetchSingleCategory = async (id) => {
    return prisma.category.findUnique({
        where: { uid: id },
        include: {
            subCategories: {
                select: {
                    uid: true,
                    name: true
                }
            }
        }
    });
};

exports.fetchCategoryQuery = async (limit, skip) => {
    return prisma.category.findMany({
        where: {
            parentId: null
        },
        select: {
            uid: true,
            name: true,
            sortOrder: true,
            image: {
                select: {
                    id: true,
                    img_url: true
                }
            },
            subCategories: {
                select: {
                    uid: true,
                    name: true,
                    // category_specifications: true
                }
            }
        },
        take: limit,
        skip: skip
    });
};

exports.fetchParentCategoryQuery = async (limit, skip) => {
    return prisma.category.findMany({
        where: {
            parentId: null
        },
        select: {
            uid: true,
            name: true,
            sortOrder: true,
            image: {
                select: {
                    id: true,
                    img_url: true
                }
            },
            subCategories: {
                select: {
                    uid: true,
                    name: true,
                    // category_specifications: true
                }
            }
        },
        take: limit,
        skip: skip
    });
};

exports.fetchOrderedCategoryForHomeQuery = async (limit, skip) => {
    return prisma.category.findMany({
        where: {
            sortOrder: {
                not: null
            }
        },
        select: {
            uid: true,
            name: true,
            sortOrder: true,
            image: {
                select: {
                    id: true,
                    img_url: true
                }
            },
            subCategories: {
                select: {
                    uid: true,
                    name: true,
                    // category_specifications: true
                }
            }
        },
        take: 4,
        skip: 0,
        orderBy: {
            sortOrder: 'asc'
        }
    });
};

exports.fetchCategoryById = async (uid) => {
    return prisma.category.findUnique({
        where: { uid }
    });
};

exports.fetchSingleCartItem = async (uid, cartId) => {
    return prisma.cart.findFirst({
        where: {
            id: Number(cartId),
            userId: uid
        }
    });
};

exports.destroyCartItem = async (uid, cartId) => {
    return prisma.cart.deleteMany({
        where: {
            id: Number(cartId),
            userId: uid
        }
    });
};

exports.deleteCategory = async (categoryId) => {
    return prisma.category.delete({
        where: { uid: categoryId }
    });
};

exports.updateSpecificCategory = async (categoryId, update) => {
    return prisma.category.update({
        where: { uid: categoryId },
        data: update
    });
};

exports.updateDifferentCategory = async (where, update) => {
    const prismaWhere = buildPrismaWhere(where);
    return prisma.category.updateMany({
        where: prismaWhere,
        data: update
    });
};