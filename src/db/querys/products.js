const { prisma } = require("../base");
const { buildPrismaWhere, addPrototypeHelpers } = require("../../util/prismaHelper");

const productSelect = {
    categoryId: true,
    uid: true,
    name: true,
    // price: true,
    // units: true,
    description: true,
    category: {
        select: {
            uid: true,
            name: true
        }
    },
    images: {
        select: {
            id: true,
            imageId: true,
            image: {
                select: {
                    img_url: true
                }
            }
        }
    },
    discount: {
        where: {
            startDate: { lt: new Date() },
            endDate: { gte: new Date() }
        }
    },
    variants: {
        select: {
            uid: true,
            name: true,
            price: true,
            units: true,
            specifications: true
        }
    }
    // p
};

const mapProduct = (p) => {
    if (!p) return p;
    const res = { ...p };

    // if (p.category) {
    //     res.Category = p.category;
    // }

    // if (p.Product_Discount) {
    //     res.Product_Discount = p.Product_Discount;
    //     res.productdiscount = p.Product_Discount;
    // }

    // if (p.Product_Images) {
    //     res.Product_Images = p.Product_Images.map(pi => ({
    //         id: pi.id,
    //         imageId: pi.imageId,
    //         image: pi.image
    //     }));
    // }

    return addPrototypeHelpers(res);
};

exports.uploadProduct = async (data) => {
    // Note: in Sequelize this returns the created product model
    const created = await prisma.product.create({
        data: {
            uid: data.uid,
            name: data.name,
            categoryId: data?.categoryId,
            // price: Number(data.price),
            description: data.description,
            // units: Number(data.units || 0),  .
            parentCategoryId: data?.parentCategoryId,

        }
    });
    return addPrototypeHelpers(created);
};

exports.getProductsByCategory = async (query, limit, offset) => {
    const where = buildPrismaWhere(query);
    where.isDeleted = false;
    where.isActive = true;

    const list = await prisma.product.findMany({
        where,
        select: productSelect,
        take: limit,
        skip: offset
    });
    return list //.map(mapProduct);
};

exports.getspecificProduct = async (productId) => {
    const p = await prisma.product.findFirst({
        where: {
            uid: productId,
            isDeleted: false
        },
        // include: {
        //     category: {
        //         select: {
        //             uid: true,
        //             name: true
        //         }
        //     },
        //     images: {
        //         select: {
        //             id: true,
        //             imageId: true,
        //             image: {
        //                 select: {
        //                     img_url: true
        //                 }
        //             }
        //         }
        //     },
        //     discount: {
        //         where: {
        //             startDate: { lt: new Date() },
        //             endDate: { gte: new Date() }
        //         }
        //     },
        //     variants: true
        // }
        select: productSelect
    });
    return p
};

exports.searchProduct = async (query, offset, limit) => {
    const where = buildPrismaWhere(query);
    where.isDeleted = false;
    where.isActive = true;

    const list = await prisma.product.findMany({
        where,
        select: productSelect,
        take: limit,
        skip: offset
    });

    // console.dir(list, {depth: 12})


    return list
    // return list.map(mapProduct);
};

exports.getDiscountedProducts = async (offset, limit) => {
    // const where = buildPrismaWhere(query);
    // where.isDeleted = false;
    // where.isActive = true;
    // where.discount = {
    //     where: {
    //         startDate: { lt: new Date() },
    //         endDate: { gte: new Date() }
    //     }
    // };

    const list = await prisma.product.findMany({
        where: {
            isDeleted: false,
            isActive: true,
            discount: {
                startDate: { lt: new Date() },
                endDate: { gte: new Date() }
            }
        },
        select: productSelect,
        take: limit,
        skip: Number(offset)
    });

    return list
    // return list.map(mapProduct);
};

exports.getProductsWithoutDiscount = async (offset, limit) => {
    const activeDiscounts = await prisma.product_Discount.findMany({
        where: {
            startDate: { lt: new Date() },
            endDate: { gte: new Date() }
        },
        select: {
            productId: true
        }
    });

    const activeProductIds = activeDiscounts.map(d => d.productId).filter(Boolean);

    const list = await prisma.product.findMany({
        where: {
            isDeleted: false,
            isActive: true,
            uid: {
                notIn: activeProductIds
            }
        },
        select: productSelect,
        take: limit,
        skip: offset
    });
    return list.map(mapProduct);
};

exports.deleteProductQuery = async (productId) => {
    return prisma.product.update({
        where: { uid: productId },
        data: { isDeleted: true }
    });
};

exports.uploadProductImages = async (data) => {
    return prisma.product_Images.createMany({
        data
    });
};

exports.updateProductDetails = async (productId, update) => {
    // We omit relation fields or non-existing fields from direct update
    const data = {};
    if (update.name !== undefined) data.name = update.name;
    if (update.categoryId !== undefined) data.categoryId = update.categoryId;
    if (update.price !== undefined) data.price = Number(update.price);
    if (update.description !== undefined) data.description = update.description;
    if (update.units !== undefined) data.units = Number(update.units);
    if (update.isActive !== undefined) data.isActive = update.isActive;
    if (update.isDeleted !== undefined) data.isDeleted = update.isDeleted;

    return prisma.product.update({
        where: { uid: productId },
        data
    });
};

exports.deleteProductImages = async (productId) => {
    return prisma.product_Images.deleteMany({
        where: {
            productId
        }
    });
};

exports.getspecificProductRaw = async (productId) => {
    const p = await prisma.product.findFirst({
        where: {
            uid: productId,
            isDeleted: false
        },
        // include: {
        //     category: {
        //         select: {
        //             uid: true,
        //             name: true
        //         }
        //     },
        //     Product_Images: {
        //         select: {
        //             id: true,
        //             imageId: true,
        //             image: {
        //                 select: {
        //                     img_url: true
        //                 }
        //             }
        //         }
        //     },
        //     Product_Discount: {
        //         where: {
        //             startDate: { lt: new Date() },
        //             endDate: { gte: new Date() }
        //         }
        //     }
        // }

        select: productSelect
    });
    // return mapProduct(p);
    return p
};

exports.getNewProducts = async () => {
    const list = await prisma.product.findMany({
        where: {
            isDeleted: false,
            isActive: true
        },
        select: productSelect,
        orderBy: {
            createdAt: "desc"
        },
        take: 10
    });
    return list.map(mapProduct);
};

exports.addDiscountToProductRecord = async (data) => {
    return prisma.product_Discount.create({
        data: {
            productId: data.productId,
            discount_type: data.discount_type,
            discount_value: Number(data.discount_value),
            startDate: data.startDate ? new Date(data.startDate) : null,
            endDate: data.endDate ? new Date(data.endDate) : null
        }
    });
};

exports.deleteDiscountToProductRecord = async (productId) => {
    return prisma.product_Discount.deleteMany({
        where: {
            productId
        }
    });
};

exports.getProductsByCategoryTree = async (categoryUid, product_query, offset = 0, limit = 20) => {
    const rows = await prisma.$queryRawUnsafe(`
        WITH RECURSIVE category_tree AS (
            SELECT uid FROM Category WHERE uid = ?
            UNION ALL
            SELECT c.uid FROM Category c
            INNER JOIN category_tree ct ON c.parentId = ct.uid
        )
        SELECT uid FROM category_tree
    `, categoryUid);

    const categoryUids = rows.map(r => r.uid).filter(Boolean);



    const where = buildPrismaWhere(product_query);


    where.categoryId = {
        in: categoryUids
    };
    where.isDeleted = false;
    where.isActive = true;

    const list = await prisma.product.findMany({
        where,
        select: productSelect,
        take: limit,
        skip: offset
    });
    return list.map(mapProduct);
};

exports.createProductVariants = async (data) => {
    return prisma.product_Variants.createMany({
        data
    });
};
