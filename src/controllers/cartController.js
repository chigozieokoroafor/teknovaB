const { Op } = require("sequelize");
const { addToCartQuery, fetchCartItems, fetchCartItemsToOrder, updateCartItemsforOrder, createOrderOnOrderTable, fetchOrdersForClient } = require("../db/querys/cart");
const { getspecificProduct, getspecificProductRaw } = require("../db/querys/products");
const { catchAsync } = require("../errorHandler/allCatch");
const { generalError, notFound, internalServerError, success } = require("../errorHandler/statusCodes");
const { createUUID, initializePayment, baseValidator } = require("../util/base");
const { PARAMS, FETCH_LIMIT } = require("../util/consts");
const { addToCartSchema, checkoutSchema } = require("../util/validators/cartValidator");
const { uploadTransaction } = require("../db/querys/transactions");
const { fetchSingleCartItem, destroyCartItem } = require("../db/querys/category");

exports.addItemToCart = catchAsync(async (req, res) => {
    const user_id = req.user.uid

    const error = baseValidator(addToCartSchema, req.body, res)
    if (error) {
        return error
    }

    let data = req.body

    const product = await getspecificProductRaw(req.body[PARAMS.productId])
    if (!product) {
        return notFound(res, "Product selected not found 🤔.")
    }

    // return success(res, product)

    // data["unit_price"] = product[PARAMS.price]
    let price = product[PARAMS.price]

    const isUnitAvailable = product[PARAMS.units] > data[PARAMS.units]

    if (!isUnitAvailable) {
        return generalError(res, "Proposed units to purchase exist the available units.")
    }

    data[PARAMS.uid] = user_id

    data[PARAMS.total_amount] = price * data[PARAMS.units]

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

    if(!cartId){
        return generalError(res, "Select a cart item to delete.")
    }

    const item = await fetchSingleCartItem(uid, cartId)

    if(!item){
        return notFound(res, "Item not found.")
    }

    await destroyCartItem(uid, cartId)

    success(res, {}, "Item deleted.")
    
})

exports.checkout = catchAsync(async (req, res) => {
    const user_id = req.user?.uid

    // "add contact info and billing info"
    const cart = await fetchCartItemsToOrder(user_id)

    if (cart.length < 1) {
        return generalError(res, "No items in cart to purchase")
    }


    const error = baseValidator(checkoutSchema, req.body, res)
    if (error) {
        return error
    }


    const orderId = `#ORD${createUUID(6)}`
    const total_amount = cart.reduce((total, current) => total + current[PARAMS.total_amount], 0)
    const cart_ids = cart.map((item) => {

        return item.id

    })

    const ref = `TRX_${createUUID(7)}`
    const response = await initializePayment(ref, total_amount, req.user?.email, { [PARAMS.orderId]: orderId, [PARAMS.cart_ids]: cart_ids })
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
            [PARAMS.contact_Info]: req.body[PARAMS.contact_Info]
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

