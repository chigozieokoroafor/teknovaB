const { prisma } = require("./base");

exports.sync = async () => {
    try {
        await prisma.$connect();
        console.log("Database connection established successfully via Prisma Client.");
    } catch (error) {
        console.error("Unable to connect to the database via Prisma Client:", error);
        throw error;
    }
};
