const { checkCategoryExists, createCategoryQuery, fetchCategoryQuery } = require("../db/querys/category");
const { uploadProduct, getProductsByCategory } = require("../db/querys/products");
const { catchAsync } = require("../errorHandler/allCatch");
const { generalError, success, notFound } = require("../errorHandler/statusCodes");
const { createUUID } = require("../util/base");
const { FETCH_LIMIT } = require("../util/consts");
const { categoryCreationSchema } = require("../util/validators/categoryValidator");
const { productUploadSchema } = require("../util/validators/productsValidator");



exports.addProducts = catchAsync(async (req, res) => {
    const valid_ = productUploadSchema.validate(req.body)
    if (valid_.error) {
        return generalError(res, valid_.error.message)
    }

    // let data = req.body

    const data = new Object()

    data["name"] = req.body?.name
    data["categoryId"] = req.body?.categoryId
    data["discount"] = req.body?.discount ?? 0.0
    data["price"] = req.body?.price
    data["img_blob"] = req.body?.file
    data["colors"] = req.body?.colors
    data["description"] = req.body?.description
    data["units"] = req.body?.units
    data["specifications"] = req.body?.specifications


    console.log("data:::;", data)
    try {
        await uploadProduct(data)
    } catch (error) {
        return generalError(res, "Unable to add product at current time.", {})
    }

    return success(res, {}, "Product uploaded successfully")
})

exports.createCategory = catchAsync(async (req, res) => {
    const valid_ = categoryCreationSchema.validate(req.body)
    if (valid_.error) {
        return generalError(res, valid_.error.message)
    }

    const data = new Object()

    data["name"] = req.body?.name
    data["img_blob"] = req.body?.file

    const cat_exists = await checkCategoryExists(req.body?.name)
    if (cat_exists) {
        return generalError(res, `Category "${req.body?.name}" exists`)
    }

    await createCategoryQuery(...data)

    return success(res, {}, "Category Created")


})

exports.fetchCategories = catchAsync(async (req, res) => {
    const data = await fetchCategoryQuery()
    return success(res, data, "Fetched")
})

exports.fetchProductsUnderCategory = catchAsync(async (req, res) => {
    const category_id = req.params?.id

    if (!category_id) {
        return generalError(res, "Kindly select a category.")
    }

    const page = req.query?.page

    if (page <= 0){
        return generalError(res, "Page cannot be less than 1") 
    }
    const offset = (Number(page) -1) * FETCH_LIMIT

    const data = await getProductsByCategory(category_id, FETCH_LIMIT, offset)

    return success(res, data, "Fetched")



})