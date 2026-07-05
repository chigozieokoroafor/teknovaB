const { Op } = require("sequelize");
const { addToCartQuery, fetchCartItems, fetchCartItemsToOrder, updateCartItemsforOrder, createOrderOnOrderTable, fetchOrdersForClient, getExtraPayments } = require("../db/querys/cart");
const { getspecificProduct, getspecificProductRaw } = require("../db/querys/products");
const { catchAsync } = require("../errorHandler/allCatch");
const { generalError, notFound, internalServerError, success } = require("../errorHandler/statusCodes");
const { createUUID, initializePayment, baseValidator, validateProvidedCoupon } = require("../util/base");
const { PARAMS, FETCH_LIMIT, MODEL_NAMES } = require("../util/consts");
const { addToCartSchema, checkoutSchema } = require("../util/validators/cartValidator");
const { uploadTransaction } = require("../db/querys/transactions");
const { fetchSingleCartItem, destroyCartItem } = require("../db/querys/category");
const { fetchSingleCouponRecord } = require("../db/querys/coupons");
const { prisma } = require("../db/base");

exports.addItemToCart = catchAsync(async (req, res) => {
    const user_id = req.user.uid

    // console.log(req.body)

    const error = baseValidator(addToCartSchema, req.body, res)
    if (error) {
        return error
    }

    let data = req.body

    

    // get specific product
    const product = await getspecificProductRaw(req.body[PARAMS.productId])
    if (!product) {
        return notFound(res, "Product selected not found 🤔.")
    }

    // success(res, product)

    // identify. specific variant
    const variant = product.variants.find(i => i.uid == req.body.variantId)

    if (!variant || variant.units < 1) {
        generalError(res, "Whoops, selected variant  is currently out of stock")
        return
    }

    // return



    // data["unit_price"] = product[PARAMS.price]
    let price = variant?.price
    let existingUnits = variant?.units

    const discObj = product.discount || product.Product_Discount;
    if (discObj) {
        const val = Number(discObj.discount_value) || 0;
        if (discObj.discount_type === "fixed") {
            price = Math.max(0, price - val);
        } else if (discObj.discount_type === "percentage") {
            price = Math.max(0, price - (price * val) / 100);
        }
    }

    const isUnitAvailable = existingUnits > data[PARAMS.units]

    if (!isUnitAvailable) {
        return generalError(res, "Proposed units to purchase not available.")
    }

    data["userId"] = user_id

    data[PARAMS.total_amount] = price * data[PARAMS.units]
    data[PARAMS.unit_price] = price
    data["specification"] = variant.specifications

    if (data[PARAMS.isTechnicianRequired]) {
        const cost = (await getExtraPayments(PARAMS.isTechnicianRequired))?.price ?? 0
        data[PARAMS.isTechnicianRequiredCost] = cost
    }

    console.dir(data, {depth: 5})



    try {
        const q = await addToCartQuery(data)
        if (!q) {
            return generalError(res, "Error while adding to cart.")
        }
        return success(res, {}, "Item added to cart")
    } catch (error) {
        console.log(error)
        return internalServerError(res, "unable to add to cart")
    }

})

exports.getCart = catchAsync(async (req, res) => {
    const user_id = req.user?.uid

    offset = 0
    const data = await fetchCartItems(user_id, offset, FETCH_LIMIT)

    const total = data.reduce((total, item) => total + item[PARAMS.total_amount], 0)

    return success(res, { cart: data, total }, "Working")
})

exports.deleteCartItems = catchAsync(async (req, res) => {
    const uid = req.user?.uid
    const cartId = req.query?.cartId

    if (!cartId) {
        return generalError(res, "Select a cart item to delete.")
    }

    const item = await fetchSingleCartItem(uid, cartId)

    if (!item) {
        return notFound(res, "Item not found.")
    }

    await destroyCartItem(uid, cartId)

    success(res, {}, "Item deleted.")

})

exports.clearCart = catchAsync(async (req, res) => {
    const uid = req.user?.uid
    await prisma.cart.deleteMany({
        where: {
            userId: uid,
            ordered: false
        }
    })
    success(res, {}, "Cart cleared.")
})

exports.checkout = catchAsync(async (req, res) => {
    const user_id = req.user?.uid
    let deliveryType = "Pick-up"
    let deliveryCost = 0.0
    let product_list = []
    let category_list = []
    let discount_type
    let discount_value = 0
    let coupon_type
    // let total_cart_amount = 0
    let coupon_usage_count = 0
    let coupon_used = false
    let coupon_code = req.body.coupon

    console.log("req body =====> ")
    console.dir(req.body, {depth: 12})

    // "add contact info and billing info"
    const cart = await fetchCartItemsToOrder(user_id)

    if (cart.length < 1) {
        return generalError(res, "No items in cart to purchase")
    }

    const error = baseValidator(checkoutSchema, req.body, res)
    if (error) {
        return error
    }

    let coupon_detail = null

    if (req.body.coupon) {
        coupon_detail = await validateProvidedCoupon(req.body.coupon)

        if (!coupon_detail.success) {
            return generalError(res, coupon_detail.msg)
        }

        product_list = coupon_detail.product_list
        category_list = coupon_detail.category_list
        discount_type = coupon_detail.discount_type
        discount_value = coupon_detail.discount_value
        coupon_type = coupon_detail.type
        coupon_used = true
    }

    const cart_ids = []

    const valid_prices = cart.map((product) => {
        let calculatedProductPrice = 0

        // console.log("product === >", product.toJSON())
        if (product_list?.includes(product.productId) || category_list?.includes(product[MODEL_NAMES.product].categoryId)) {
            if (discount_type.toLowerCase() == "fixed") {
                calculatedProductPrice = (product.unit_price - discount_value) * product.units
            } else {
                calculatedProductPrice = (product.unit_price - (product.unit_price * (discount_value / 100))) * product.units
            }
            coupon_usage_count += 1
        } else {
            calculatedProductPrice = product[PARAMS.total_amount] //+ product[PARAMS.isTechnicianRequiredCost]
        }
        cart_ids.push(product.id)

        return calculatedProductPrice + product[PARAMS.isTechnicianRequiredCost]
    })

    // const total_cart_amount_ = cart.reduce((total, current) => total + current[PARAMS.total_amount] + current[PARAMS.isTechnicianRequiredCost], 0) 

    const total_cart_amount = valid_prices.reduce((total, current) => total + current, 0)

    // console.log ({
    //     coupon_detail,
    //     total_cart_amount_,
    //     total_cart_amount
    // })


    const orderId = `#ORD${createUUID(6)}`

    if (req.body[PARAMS.deliveryType]) {
        if (!["pickup", "free", "express"].includes(req.body[PARAMS.deliveryType].toLowerCase())) {
            return generalError(res, "Selected delivery method is not available.")
        }

        deliveryType = req.body[PARAMS.deliveryType]

        if (deliveryType.toLowerCase() === "express") {
            if (req.body.deliveryStateId) {
                const state = await prisma.deliveryState.findFirst({
                    where: { id: Number(req.body.deliveryStateId) }
                });
                if (state) {
                    deliveryCost = state.flatPrice ?? 0.0;
                }
            } else if (req.body.deliveryZoneId) {
                const zone = await prisma.deliveryZone.findFirst({
                    where: { id: Number(req.body.deliveryZoneId) }
                });
                if (zone) {
                    deliveryCost = zone.price ?? 0.0;
                }
            }
        } 

        if (coupon_type == "shipping") {
            if (deliveryCost > 0) {
                deliveryCost = discount_type == "fixed" ? deliveryCost - discount_value : deliveryCost - (deliveryCost * (discount_value / 100))
            }

            coupon_usage_count += 1
        }
    }

    const total_amount = coupon_type == "order" ?
        (discount_type == "fixed" ?
            (total_cart_amount + deliveryCost) - discount_value :
            (total_cart_amount + deliveryCost) - ((total_cart_amount + deliveryCost) * (discount_value / 100))
        ) :
        (total_cart_amount + deliveryCost)

    if (coupon_type == "order") coupon_usage_count += 1

    console.log({total_amount, total_cart_amount, deliveryCost})

    const ref = `TRX_${createUUID(7)}`
    const response = await initializePayment(ref, total_amount, req.user?.email, { [PARAMS.orderId]: orderId, [PARAMS.cart_ids]: cart_ids, coupon_used, coupon_code })
    if (!response.success) {
        return generalError(res, response.msg,)
    }

    success(res, { url: response.url }, "Click to get to payment.")

    await uploadTransaction(
        {
            [PARAMS.uid]: user_id,
            [PARAMS.orderId]: orderId,
            [PARAMS.reference]: ref,
            [PARAMS.amount]: total_amount,
        }
    )

    await createOrderOnOrderTable(
        {
            [PARAMS.uid]: user_id,
            [PARAMS.orderId]: orderId,
            [PARAMS.billing_address]: req.body[PARAMS.billing_address],
            [PARAMS.contact_Info]: req.body[PARAMS.contact_Info],
            [PARAMS.deliveryType]: deliveryType,
            [PARAMS.deliveryCost]: deliveryCost
        }
    )
})

exports.getOrders = catchAsync(async (req, res) => {
    const user_id = req.user?.uid

    const page = req.query?.page

    if (!page || Number.isNaN(page) || Number(page) < 1) return generalError(res, "Kindly provide page as a number greater than one.")

    const limit = 10
    const offset = (Number(page) - 1) * limit

    const data = await fetchOrdersForClient(user_id, limit, offset)

    return success(res, data, "Fetched")
})

exports.getDeliveryPrices = catchAsync(async (req, res) => {
    const extra = (await getExtraPayments("express"))?.price ?? 0.0

    return success(res, { express: extra, free: 0.0, pickup: 0.0 })
})

exports.validateCoupon = catchAsync(async (req, res) => {
    const code = req?.body?.code

    if (!code) {
        return generalError(res, "Kindly provide a coupon code for use.")
    }

    const coupon = await fetchSingleCouponRecord(
        {
            code,
            status: "Active",
            endDate: {
                [Op.gte]: new Date()
            }
        }
    )

    if (!coupon) {
        return notFound(res, "Sorry, seems the coupon provided has expired.")
    }

    if (coupon.limit <= coupon.usage) {
        return generalError(res, "Oops, Coupon")
    }

    const data = {
        code,
        status: coupon.status,
        coupon_type: coupon[PARAMS.coupon_type],
        discount_type: coupon[PARAMS.discount_type],
        discount_value: coupon[PARAMS.discount_value],
        list: coupon[PARAMS.coupon_type].toLowerCase() == "product" ? coupon[PARAMS.product_list] : (coupon[PARAMS.coupon_type].toLowerCase() == "category" ? coupon[PARAMS.category_list] : undefined)

    }

    return success(res, data, "Fetched.")
})