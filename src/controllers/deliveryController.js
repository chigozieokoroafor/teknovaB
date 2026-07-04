const { prisma } = require("../db/base");
const { catchAsync } = require("../errorHandler/allCatch");
const { generalError, success, notFound } = require("../errorHandler/statusCodes");
const { addPrototypeHelpers } = require("../util/prismaHelper");

// CREATE STATE (with optional zones)
exports.createState = catchAsync(async (req, res) => {
    const { name, priceType, flatPrice, zones } = req.body;

    if (!name) {
        return generalError(res, "State name is required.");
    }

    // Check if state already exists
    const existing = await prisma.deliveryState.findFirst({
        where: {
            name: name
        }
    });

    if (existing) {
        return generalError(res, `State "${name}" already exists.`);
    }

    const newState = await prisma.deliveryState.create({
        data: {
            name,
            priceType: priceType || "FLAT",
            flatPrice: priceType === "FLAT" ? Number(flatPrice || 0) : null,
            zones: {
                create: priceType === "ZONED" && zones && Array.isArray(zones) ? zones.map(z => ({
                    name: z.name,
                    price: Number(z.price || 0),
                    locations: z.locations || []
                })) : []
            }
        },
        include: {
            zones: true
        }
    });

    return success(res, newState, "State added successfully.");
});

// FETCH ALL STATES
exports.fetchStates = catchAsync(async (req, res) => {
    const states = await prisma.deliveryState.findMany({
        include: {
            zones: true
        },
        orderBy: {
            name: "asc"
        }
    });

    return success(res, states, "States fetched successfully.");
});

// UPDATE STATE & RE-SYNC ZONES
exports.updateState = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { name, priceType, flatPrice, zones } = req.body;

    const existing = await prisma.deliveryState.findUnique({
        where: { id: Number(id) }
    });

    if (!existing) {
        return notFound(res, "State not found.");
    }

    // Update state fields
    await prisma.deliveryState.update({
        where: { id: Number(id) },
        data: {
            name: name !== undefined ? name : existing.name,
            priceType: priceType !== undefined ? priceType : existing.priceType,
            flatPrice: priceType === "FLAT" ? Number(flatPrice || 0) : null
        }
    });

    // Re-sync zones if state is updateable
    await prisma.deliveryZone.deleteMany({
        where: { stateId: Number(id) }
    });

    const activePriceType = priceType !== undefined ? priceType : existing.priceType;
    if (activePriceType === "ZONED" && zones && Array.isArray(zones)) {
        await prisma.deliveryZone.createMany({
            data: zones.map(z => ({
                stateId: Number(id),
                name: z.name,
                price: Number(z.price || 0),
                locations: z.locations || []
            }))
        });
    }

    const updated = await prisma.deliveryState.findUnique({
        where: { id: Number(id) },
        include: {
            zones: true
        }
    });

    return success(res, addPrototypeHelpers(updated), "State updated successfully.");
});

// DELETE STATE
exports.deleteState = catchAsync(async (req, res) => {
    const { id } = req.params;

    const existing = await prisma.deliveryState.findUnique({
        where: { id: Number(id) }
    });

    if (!existing) {
        return notFound(res, "State not found.");
    }

    await prisma.deliveryState.delete({
        where: { id: Number(id) }
    });

    return success(res, {}, "State deleted successfully.");
});

// DYNAMIC PRICE CALCULATION
exports.getDeliveryPrice = catchAsync(async (req, res) => {
    const { state, location } = req.query;

    if (!state) {
        // Return default express price if no state is specified
        const extra = (await prisma.extraPayments.findFirst({
            where: { name: "express" }
        }))?.price ?? 0.0;
        return success(res, { express: extra, free: 0.0, pickup: 0.0 }, "Default delivery price fetched.");
    }

    // Find the state either by ID or case-insensitive Name match
    const searchState = await prisma.deliveryState.findFirst({
        where: {
            OR: [
                { name: state },
                { id: !isNaN(Number(state)) ? Number(state) : -1 }
            ]
        },
        include: {
            zones: true
        }
    });

    if (!searchState) {
        return notFound(res, `State "${state}" not found.`);
    }

    if (searchState.priceType === "FLAT") {
        return success(res, {
            express: searchState.flatPrice || 0.0,
            free: 0.0,
            pickup: 0.0
        }, "Flat state delivery price fetched.");
    }

    // Zoned logic: search for the matching location in the state's zones
    let expressCost = 0.0;
    if (location) {
        const normalizedLocation = location.trim().toLowerCase();
        const matchedZone = searchState.zones.find(z => {
            const locationsList = Array.isArray(z.locations) ? z.locations : [];
            return locationsList.some(loc => typeof loc === "string" && loc.trim().toLowerCase() === normalizedLocation);
        });

        if (matchedZone) {
            expressCost = matchedZone.price;
        }
    }

    return success(res, {
        express: expressCost,
        free: 0.0,
        pickup: 0.0
    }, "Zoned delivery price fetched.");
});
