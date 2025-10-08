require("dotenv").config()

const { checkAdmin } = require("../db/querys/admin");
const { countOrders, fetchAllOrders, updateOrderStatus, getSpecificOrder, getTopProductCounts } = require("../db/querys/cart");
const { createCouponRecord, fetchCouponRecord, updateSingleCouponRecord, deleteSingleCouponRecord, fetchSingleCouponRecord } = require("../db/querys/coupons");
const { uploadBulkImages, fetchImages, fetchSingleImage, deleteImage, countAllImages } = require("../db/querys/images");

const { fetchTransactions, getRevenue } = require("../db/querys/transactions");
const { getUserByEmail, countUsers } = require("../db/querys/users");
const { catchAsync } = require("../errorHandler/allCatch");
const { generalError, success, notFound } = require("../errorHandler/statusCodes");
const { generateToken, checkPassword, processAllImages, deleteImageFromBunny, baseValidator, sendOrderUpdateNotifcationMail, createUUID } = require("../util/base");
const { PARAMS } = require("../util/consts");
const { loginValidator } = require("../util/validators/accountValidator");
const { orderStatusUpdateSchema } = require("../util/validators/cartValidator");
const { couponCreateValidator, couponUpdateValidator } = require("../util/validators/couponValidator");

exports.login = catchAsync(async (req, res) => {

    // const valid_ = loginValidator.validate(req.body)

    // if (valid_.error) {
    //     return generalError(res, valid_.error.message)
    // }

    const error = baseValidator(loginValidator, req.body, res)
    if (error) {
        return error
    }

    const user = await getUserByEmail(req.body?.email)

    if (!user) {
        return notFound(res, "Admin Account not found.")
    }

    const uid = user.uid
    const adminCheck = await checkAdmin(uid)
    if (!adminCheck) {
        return notFound(res, "Account not found")
    }

    const passwordMatch = checkPassword(req.body?.password, user.password)
    if (!passwordMatch) {
        return generalError(res, "Invalid Credentials")
    }
    // put email verification here to check if userIsn't verified

    const token = generateToken({ id: user.uid, userType: "admin" }, 14 * 60 * 60000, process.env.ADMIN_SECRET)

    // do a set session here instead of returning authorization token.

    return success(res, { token }, "Login successful")

})

// for images
exports.uploadImages = catchAsync(async (req, res) => {
    success(res, {}, "Processing")

    const name = req.body.name
    const urls = await processAllImages(req.files, name ?? `IMG_${createUUID(5)}`)

    await uploadBulkImages(urls)

})

exports.getImages = catchAsync(async (req, res) => {
    // const urls = processAllImages(req.files)
    const page = req.query?.page

    if (!page || Number.isNaN(page) || Number(page) < 1) return generalError(res, "Kindly provide page as a number greater than one.")

    const limit = 10
    const offset = (Number(page) - 1) * limit

    const [data, totalCount] = await Promise.allSettled([fetchImages(limit, offset), countAllImages()])

    const pages = Math.ceil(totalCount.value / limit)



    success(res, { images: data.value, pages: pages }, "Fetching")

})

exports.deleteImages = catchAsync(async (req, res) => {
    const id = req.params.id

    const img = await fetchSingleImage(id)
    if (!img) {
        return notFound(res, "Selected image not found.")
    }

    const img_url = img.img_url
    const splits = img_url.split("/")
    const file = splits[splits.length - 1]
    const deleteRequest = await deleteImageFromBunny(file)

    if (!deleteRequest) {
        return generalError(res, "Unnale to delete", {})
    }
    await deleteImage(id)

    success(res, {}, "Image deleted.")


    return
})

// for dashboard

exports.metrics = catchAsync(async (req, res) => {

    const rev = await getRevenue()
    const orders = await countOrders()
    const users = await countUsers()

    const revenue = rev[0].revenue_sum

    return success(res, { revenue, orders, users }, "Fetched")
})

exports.getRecentTransactions = catchAsync(async (req, res) => {
    const page = req.query?.page

    if (!page || Number.isNaN(page) || Number(page) < 1) return generalError(res, "Kindly provide page as a number greater than one.")

    const limit = 10
    const offset = (Number(page) - 1) * limit

    const transactions = await fetchTransactions(limit, offset)

    return success(res, transactions, "Fetched")
})

exports.getTopProducts = catchAsync(async (req, res) => {
    const products = await getTopProductCounts()
    return success(res, products, "Fetched")
})

exports.getOrders = catchAsync(async (req, res) => {
    const page = req.query?.page

    if (!page || Number.isNaN(page) || Number(page) < 1) return generalError(res, "Kindly provide page as a number greater than one.")

    const limit = 10
    const offset = (Number(page) - 1) * limit

    const data = await fetchAllOrders(limit, offset)

    return success(res, data)
})

exports.updateStatusOfOrders = catchAsync(async (req, res) => {
    const error = baseValidator(orderStatusUpdateSchema, req.body, res)
    if (error) {
        return error
    }

    const orderId = req.body[PARAMS.orderId]
    const status = req.body[PARAMS.status]
    const order = await getSpecificOrder(orderId)
    if (!order) {
        return notFound(res, `Order ${orderId} not found.`)
    }

    // console.log(order)

    const update = await updateOrderStatus(orderId, status)

    success(res, {}, "Status updated.")

    const email = order?.User?.email

    if (email) {
        sendOrderUpdateNotifcationMail(email, orderId, status, order.createdAt, new Date().getUTCFullYear())
    }
    // add a notification here.

})

// for coupons
exports.createCoupons = catchAsync(async (req, res) => {
    const valid_ = couponCreateValidator.validate(req.body)
    if (valid_.error) {
        return generalError(res, valid_.error.message, valid_.error.details[0].context)
    }

    const exists = await fetchSingleCouponRecord({[PARAMS.code]: req.body[PARAMS.code] })

    if(exists){
        return generalError(res, "Coupon with provided code exists")
    }

    await createCouponRecord(req.body)

    return success(res, {}, "Coupon created")
})

exports.fetchCoupons = catchAsync(async (req, res) => {
    const page = req.query?.page

    if (!page || Number.isNaN(page) || Number(page) < 1) return generalError(res, "Kindly provide page as a number greater than one.")

    const limit = 10
    const offset = (Number(page) - 1) * limit

    const data = await fetchCouponRecord(limit, offset)

    return success(res, data, "Fetched.")
})

exports.deleteCoupon = catchAsync(async (req, res) => {
    const id = req.params.id
    await deleteSingleCouponRecord(id)

    return success(res, {}, "Coupon Deleted")
})

exports.updateCoupon = catchAsync(async (req, res) => {
    const id = req.params.id

    const valid_ = couponUpdateValidator.validate(req.body)
    if (valid_.error) {
        return generalError(res, valid_.error.message, valid_.error.details[0].context)
    }

    const exist = await fetchSingleCouponRecord({id})

    

    if(!exist){
        return  notFound(res, "Coupon not found.")
    }

    await updateSingleCouponRecord(id, req.body)

    return success(res, {}, "Updated.")
})