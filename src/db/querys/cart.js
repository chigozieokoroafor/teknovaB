const { prisma } = require("../base");
const { buildPrismaWhere } = require("../../util/prismaHelper");

const mapCartItem = (item) => {
    if (!item) return item;
    const res = { ...item };
    if (item.product) {
        res.Product = {
            uid: item.product.uid,
            name: item.product.name,
            price: item.product.price,
            Product_Images: (item.product.Product_Images || []).map(pi => ({
                id: pi.id,
                imageId: pi.imageId,
                image: pi.image
            }))
        };
        delete res.product;
    }
    return res;
};

const mapOrder = (order) => {
    if (!order) return order;
    const res = { ...order };
    if (order.Cart) {
        const mappedCarts = order.Cart.map(mapCartItem);
        res.Cart = mappedCarts;
        res.Carts = mappedCarts;
    }
    if (order.user) {
        res.User = order.user;
    }
    if (order.Transactions) {
        res.Transaction = order.Transactions;
        res.Transactions = order.Transactions;
    }
    return res;
};

exports.getExtraPayments = async (name) => {
    return prisma.extraPayments.findFirst({
        where: { name }
    });
};

exports.addToCartQuery = async (data) => {
    return prisma.cart.create({
        data
    });
};

exports.fetchCartItems = async (uid, offset, limit) => {
    const items = await prisma.cart.findMany({
        where: {
            uid,
            ordered: false
        },
        include: {
            product: {
                select: {
                    uid: true,
                    name: true,
                    // price: true,
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
                    }
                }
            }
        },
        skip: offset,
        take: limit
    });
    return items.map(mapCartItem);
};

exports.fetchCartItemsToOrder = async (uid) => {
    const items = await prisma.cart.findMany({
        where: {
            uid,
            ordered: false
        },
        select: {
            id: true,
            productId: true,
            total_amount: true,
            isTechnicianRequiredCost: true,
            product: {
                select: {
                    uid: true,
                    categoryId: true,
                    price: true
                }
            }
        }
    });
    return items.map(item => {
        const obj = { ...item };
        obj.Product = item.product;
        delete obj.product;
        return obj;
    });
};

exports.updateCartItemsforOrder = async (update, where) => {
    const prismaWhere = buildPrismaWhere(where);
    return prisma.cart.updateMany({
        where: prismaWhere,
        data: update
    });
};

exports.countOrders = async () => {
    return prisma.cart.count({
        where: {
            ordered: true
        }
    });
};

exports.createOrderOnOrderTable = async (data) => {
    return prisma.orders.create({
        data
    });
};

exports.fetchOrdersForClient = async (uid, limit, offset) => {
    const orders = await prisma.orders.findMany({
        where: {
            uid
        },
        include: {
            Cart: {
                include: {
                    product: {
                        select: {
                            uid: true,
                            name: true,
                            price: true,
                            Product_Images: {
                                select: {
                                    id: true,
                                    imageId: true,
                                    image: {
                                        select: {
                                            img_url: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        take: limit,
        skip: offset
    });
    return orders.map(mapOrder);
};

exports.fetchAllOrders = async (limit, offset) => {
    const orders = await prisma.orders.findMany({
        include: {
            user: {
                select: {
                    name: true,
                    email: true
                }
            },
            Transactions: {
                select: {
                    amount: true
                }
            }
        },
        take: limit,
        skip: offset
    });
    return orders.map(mapOrder);
};

exports.updateOrderStatus = async (orderId, status) => {
    return prisma.orders.update({
        where: { orderId },
        data: { status }
    });
};

exports.updateOrderPaymentStatus = async (orderId, status) => {
    return prisma.orders.update({
        where: { orderId },
        data: { paymentStatus: status }
    });
};

exports.getSpecificOrder = async (orderId) => {
    const order = await prisma.orders.findUnique({
        where: { orderId },
        include: {
            user: {
                select: {
                    name: true,
                    email: true
                }
            }
        }
    });
    return mapOrder(order);
};

exports.getTopProductCounts = async () => {
    const topSales = await prisma.$queryRawUnsafe(`
        SELECT productId, COUNT(productId) AS count, SUM(CAST(units AS DOUBLE)) AS totalUnitSold
        FROM Cart
        WHERE ordered = true
        GROUP BY productId
        ORDER BY totalUnitSold DESC
        LIMIT 5
    `);

    if (topSales.length === 0) return [];

    const productIds = topSales.map(item => item.productId).filter(Boolean);

    const products = await prisma.product.findMany({
        where: {
            uid: { in: productIds }
        },
        select: {
            uid: true,
            name: true,
            price: true,
            Product_Images: {
                select: {
                    imageId: true,
                    image: {
                        select: {
                            img_url: true
                        }
                    }
                }
            }
        }
    });

    const productMap = new Map(products.map(p => [p.uid, p]));

    return topSales.map(sale => {
        const prod = productMap.get(sale.productId);
        return {
            productId: sale.productId,
            count: Number(sale.count),
            totalUnitSold: Number(sale.totalUnitSold),
            Product: prod ? {
                name: prod.name,
                price: prod.price,
                Product_Images: prod.Product_Images.map(pi => ({
                    imageId: pi.imageId,
                    image: pi.image ? { img_url: pi.image.img_url } : null
                }))
            } : null
        };
    });
};