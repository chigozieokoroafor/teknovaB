const { Sequelize, Op } = require("sequelize");
const { checkCategoryExists, createCategoryQuery, fetchCategoryQuery, deleteCategory, fetchCategoryById, createCategorySpecification } = require("../db/querys/category");
const { uploadProduct, getProductsByCategory, getspecificProduct, searchProduct, deleteProductQuery, uploadProductImages, uploadProductSpecification } = require("../db/querys/products");
const { catchAsync } = require("../errorHandler/allCatch");
const { generalError, success, notFound } = require("../errorHandler/statusCodes");
const { createUUID, sendEmail } = require("../util/base");
const { FETCH_LIMIT, PARAMS } = require("../util/consts");
const { categoryCreationSchema } = require("../util/validators/categoryValidator");
const { productUploadSchema } = require("../util/validators/productsValidator");

exports.createCategory = catchAsync(async (req, res) => {
    const valid_ = categoryCreationSchema.validate(req.body)
    if (valid_.error) {
        return generalError(res, valid_.error.message)
    }

    const data = req.body

    const specifications = data.specifications

    const cat_exists = await checkCategoryExists(req.body?.name)
    if (cat_exists) {
        return generalError(res, `Category "${req.body?.name}" exists`)
    }

    const category = await createCategoryQuery(data)

    const cat_id = category.uid
    specifications.map((item, index) => {
        item[PARAMS.categoryId] = cat_id
        item[PARAMS.values] = item[PARAMS.values].split(",")
        specifications[index] = item
    })

    await createCategorySpecification(specifications)

    return success(res, {}, "Category Created")

})

exports.fetchCategories = catchAsync(async (req, res) => {
    const data = await fetchCategoryQuery()
    return success(res, data, "Fetched")
})

exports.deleteCategory = catchAsync(async (req, res) => {

    const categoryId = req.params.category_id

    const exists = fetchCategoryById(categoryId)
    if (!exists) {
        return notFound(res, "Category not found")
    }

    await deleteCategory(categoryId)

    return success(res, {}, "Category deleted")
})

exports.addProducts = catchAsync(async (req, res) => {
    const valid_ = productUploadSchema.validate(req.body)
    if (valid_.error) {
        return generalError(res, valid_.error.message)
    }

    let data = {}

    data["name"] = req.body?.name
    data["categoryId"] = req.body?.categoryId
    data["discount"] = req.body?.discount ?? 0.0
    data["price"] = req.body?.price
    // data["img_url"] = req.body?.img_url
    // data["colors"] = req.body?.colors
    data["description"] = req.body?.description
    data["units"] = req.body?.units
    // data["specifications"] = req.body?.specifications

    // console.log("item ==> ", req.body)

    try {
        const productId = (await uploadProduct(data)).uid
        const images = req.body["images"]
        const specifications = req.body["specifications"]

        images.map((img, index) => {
            images[index] = {
                [PARAMS.productId]: productId,
                [PARAMS.imageId]: img
            }
        })

        specifications.map((spec, index) => {
            spec.productId = productId
            specifications[index] = spec
        })

        await uploadProductImages(images)
        await uploadProductSpecification(specifications)

    } catch (error) {
        sendEmail("Error on product upload", "okoroaforc14@gmail.com", error)
        return generalError(res, "Unable to add product at current time.", {})
    }

    return success(res, {}, "Product uploaded successfully")
})

exports.fetchProductsUnderCategory = catchAsync(async (req, res) => {
    const category_id = req.params?.category_id

    if (!category_id) {
        return generalError(res, "Kindly select a category.")
    }

    const page = req.query?.page

    if (page <= 0 || Number.isNaN(Number(page))) {
        return generalError(res, "Page cannot be less than 1")
    }
    const offset = (Number(page) - 1) * FETCH_LIMIT

    const data = await getProductsByCategory(category_id, FETCH_LIMIT, offset)

    return success(res, data, "Fetched")



})

exports.getSpecificProduct = catchAsync(async (req, res) => {
    const product_id = req.params?.product_id

    const data = await getspecificProduct(product_id)

    return success(res, data, "Fetched")

})

exports.getAllProducts = catchAsync(async (req, res) => {
    const page = req.query?.page

    if (page <= 0 || Number.isNaN(Number(page))) {
        return generalError(res, "Page cannot be less than 1")
    }
    const offset = (Number(page) - 1) * FETCH_LIMIT

    const products = await searchProduct({}, offset, FETCH_LIMIT)
    return success(res, products, "Fetched")
})

exports.deleteProducts = catchAsync(async (req, res) => {
    const product_id = req.query.product_id

    if (!product_id) {
        return generalError(res, "Kindly select product to delete")
    }

    const q = await deleteProductQuery(product_id)

    console.log(q)

    return success(res, {}, "deleted")

})

// for search
exports.getAllProductsWithFilter = catchAsync(async (req, res) => {
    const { category, search, max_price, min_price, page } = req.query

    if (page <= 0 || !page) {
        return generalError(res, "Page cannot be less than 1")
    }

    const offset = (Number(page) - 1) * FETCH_LIMIT
    let actual_query = {}
    // const query_list = []
    let sub = {}

    if (search) {
        // query_list.push(Sequelize.literal(`MATCH (${PARAMS.name}) AGAINST("${search}" IN BOOLEAN MODE)`),)
        actual_query[PARAMS.name] = {
            [Op.like]: `%${search}%`
        }

    }
    if (category) {
        actual_query[PARAMS.categoryId] = category
    }
    if (max_price && min_price) {
        actual_query[PARAMS.price] = {
            [Op.between]: [Number(min_price), Number(max_price)]
        }
    }

    const data = await searchProduct(actual_query, offset, FETCH_LIMIT)

    return success(res, data, "testing")

})


// merge these 2 items into 1 for the home page.
exports.getPopularProducts = catchAsync(async (req, res) => {

})

exports.getNewArrivals = catchAsync(async (req, res) => {

})