const { Sequelize, Op } = require("sequelize");
const {
    checkCategoryExists,
    createCategoryQuery,
    fetchCategoryQuery,
    deleteCategory,
    fetchCategoryById,
    updateSpecificCategory,
    // createCategorySpecification 
} = require("../db/querys/category");
const { uploadProduct, getProductsByCategory, getspecificProduct, searchProduct, deleteProductQuery, uploadProductImages, deleteProductImages, updateProductDetails, getNewProducts, deleteDiscountToProductRecord, addDiscountToProductRecord } = require("../db/querys/products");
const { catchAsync } = require("../errorHandler/allCatch");
const { generalError, success, notFound } = require("../errorHandler/statusCodes");
const { createUUID, sendEmail, baseValidator } = require("../util/base");
const { FETCH_LIMIT, PARAMS, MODEL_NAMES } = require("../util/consts");
const { categoryCreationSchema, categoryUpdateSchema } = require("../util/validators/categoryValidator");
const { productUploadSchema, productUpdateSchema } = require("../util/validators/productsValidator");
const { getTopProductCounts } = require("../db/querys/cart");
const { discountValidator } = require("../util/validators/couponValidator");

// admin category 
exports.createCategory = catchAsync(async (req, res) => {

    const error = baseValidator(categoryCreationSchema, req.body, res)
    if (error) {
        return error
    }

    let data = req.body

    const specifications = data.specifications

    const cat_exists = await checkCategoryExists(req.body?.name)
    if (cat_exists) {
        return generalError(res, `Category "${req.body?.name}" exists`)
    }

    // const cat_id = category.uid
    specifications.map((item, index) => {
        // item[PARAMS.categoryId] = cat_id
        item[PARAMS.values] = item[PARAMS.values].split(",")
        specifications[index] = item
    })

    data[PARAMS.category_specifications] = specifications

    const category = await createCategoryQuery(data)

    // await createCategorySpecification(specifications)

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

exports.updateCategory = catchAsync(async (req, res) => {
    const categoryId = req.params.category_id

    const error = baseValidator(categoryUpdateSchema, req.body, res)
    if (error) {
        return error
    }

    const exists = fetchCategoryById(categoryId)
    if (!exists) {
        return notFound(res, "Category not found")
    }

    if (req.body?.specifications) {
        const specifications = req.body.specifications
        specifications.map((item, index) => {
            // item[PARAMS.categoryId] = cat_id
            item[PARAMS.values] = typeof item[PARAMS.values] == "string" ? item[PARAMS.values].split(",").map((val, index) => { return val.trim(" ") }) : item[PARAMS.values]
            specifications[index] = item
        })

        req.body[PARAMS.category_specifications] = specifications
    }

    await updateSpecificCategory(categoryId, req.body)

    return success(res, {}, "Updated.")






})

// admin products
exports.addProducts = catchAsync(async (req, res) => {

    const error = baseValidator(productUploadSchema, req.body, res)
    if (error) {
        return error
    }

    const category_exists = await fetchCategoryById(req.body?.categoryId)
    if (!category_exists) {
        return notFound(res, "Category selected not found")
    }

    let data = {}

    data["name"] = req.body?.name
    data["categoryId"] = req.body?.categoryId
    data["discount"] = req.body?.discount ?? 0.0
    data["price"] = req.body?.price
    data["description"] = req.body?.description
    data["units"] = req.body?.units
    data[MODEL_NAMES.product_specifications] = req.body["specifications"]

    try {
        const productId = (await uploadProduct(data)).uid
        const images = req.body["images"]
        // const specifications = req.body["specifications"]

        images.map((img, index) => {
            images[index] = {
                [PARAMS.productId]: productId,
                [PARAMS.imageId]: img
            }
        })

        await uploadProductImages(images)

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

    const { t, h, l } = req.query

    const s_q = {
        categoryId: category_id
    }

    if (t) {
        s_q[Op.or] = [
            {
                [PARAMS.name]: {
                    [Op.like]: `%${t}%`
                }
            },

            {
                [PARAMS.description]: {
                    [Op.like]: `%${t}%`
                }
            }
        ]
    }

    if (l && !h) {
        s_q[PARAMS.price] = {
            [Op.gte]: l
        }
    }

    if (l && h) {
        s_q[PARAMS.price] = {
            [Op.between]: [l, h]
        }
    }

    const category_exists = await fetchCategoryById(category_id)
    if (!category_exists) {
        return notFound(res, "Category selected not found")
    }

    const offset = (Number(page) - 1) * FETCH_LIMIT


    const data = await getProductsByCategory(s_q, FETCH_LIMIT, offset)

    return success(res, data, "Fetched")

})

exports.getSpecificProduct = catchAsync(async (req, res) => {
    const product_id = req.params?.product_id

    const data = await getspecificProduct(product_id)

    if (!data) {
        return notFound(res, "Product not found.")
    }

    return success(res, data, "Fetched")

})

exports.getAllProducts = catchAsync(async (req, res) => {
    const page = req.query?.page

    if (page <= 0 || Number.isNaN(Number(page))) {
        return generalError(res, "Page cannot be less than 1")
    }
    const offset = (Number(page) - 1) * FETCH_LIMIT

    const { t, h, l } = req.query

    const s_q = {}

    if (t) {
        s_q[Op.or] = [
            {
                [PARAMS.name]: {
                    [Op.like]: `%${t}%`
                }
            },

            {
                [PARAMS.description]: {
                    [Op.like]: `%${t}%`
                }
            }
        ]
    }

    if (l && !h) {
        s_q[PARAMS.price] = {
            [Op.gte]: l
        }
    }

    if (l && h) {
        s_q[PARAMS.price] = {
            [Op.between]: [l, h]
        }
    }

    const products = await searchProduct(s_q, offset, FETCH_LIMIT)
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

exports.updateProducts = catchAsync(async (req, res) => {
    const productId = req.params.product_id

    const valid_ = productUpdateSchema.validate(req.body)
    if (valid_.error) {

        generalError(res, valid_.error.message, {})
        return
    }

    const product = await getspecificProduct(productId)

    if (!product) {
        notFound(res, "Product not found")
        return
    }

    let update = Object(req.body)

    let spec = null

    if (update[PARAMS.specifications]) {
        update[MODEL_NAMES.product_specifications] = update[PARAMS.specifications]
    }

    if (update[PARAMS.images]) {
        const images = update[PARAMS.images]

        images.map((img, index) => {
            images[index] = {
                [PARAMS.productId]: productId,
                [PARAMS.imageId]: img
            }
        })

        await deleteProductImages(productId)


        await uploadProductImages(images)

    }

    await updateProductDetails(productId, update)

    success(res, {}, "product updated.")

    try {
        // process specifications
        const existing_specifications = []
        const new_spec = []
        const existing_specifications_id = []

        const queries = []

        if (spec) {

            spec.forEach((item) => {
                if (item?.id) {
                    existing_specifications.push(item)
                    existing_specifications_id.push(item.id)
                } else {
                    item.productId = productId
                    new_spec.push(item)
                }
            })


            if (existing_specifications_id.length > 0) {
                await deleteBulkSpecification(productId, existing_specifications_id)
            }

            if (existing_specifications.length > 0) {
                existing_specifications.forEach((item) => {
                    queries.push(
                        updateProductSpecification({ units: item.units }, item.id)
                    )
                })
            }

            if (new_spec.length > 0) {
                queries.push(
                    insertProductspecification(new_spec)
                )
            }

        }
    } catch (error) {
        console.log("error:::: productUpdate :::", error)
    }
})

exports.getProductForUpdate = catchAsync(async (req, res) => {
    const productId = req.params.product_id

    const product = (await getspecificProduct(productId))?.toJSON()
    if (!product) {
        return notFound(res, "Product not found.")
    }

    const x = new Map(Object.entries(product))
    // console.log("x ====> ",x)

    const images = x.get("Product_Images").map(item => { return item.imageId })
    const specifications = x.get("Product_Specifications")

    x.set("images", images)
    x.set("specifications", specifications)

    x.delete("Product_Images")
    x.delete("Product_Specifications")

    const product_ = Object.fromEntries(x)
    return success(res, product_, "")
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
    const products = await getTopProductCounts()
    return success(res, products, "Fetched")
})

exports.getNewArrivals = catchAsync(async (req, res) => {
    const products = await getNewProducts()
    return success(res, products, "Fetched")
})

exports.addDiscountToProducts = catchAsync(async (req, res) => {

    const error = baseValidator(discountValidator, req.body, res)
    if (error) {
        return error
    }

    let product = await getspecificProduct(req.body[PARAMS.productId])

    if (!product) {
        return notFound(res, "Product not found.")
    }

    product = product.toJSON()
    
    const price = req.body[PARAMS.discount_type].toLowerCase() == "percentage" ? product.price - (product.price * req.body[PARAMS.discount_value] / 100) : product.price - req.body[PARAMS.discount_value]

    const body = {
        productId: product.uid,
            price,
        [PARAMS.startDate]: req.body[PARAMS.startDate],
        [PARAMS.endDate]: req.body[PARAMS.endDate],
    }
    await deleteDiscountToProductRecord(body.productId)

    success(res, {}, "Discount added to product.")

    await addDiscountToProductRecord(body)

})

exports.deleteDiscountFromProducts = catchAsync(async (req, res,) => {
    const product = await getspecificProduct(req.query[PARAMS.productId])

    if (!product) {
        return notFound(res, "Product not found.")
    }

    await deleteDiscountToProductRecord(req.query[PARAMS.productId])

    return success(res , {}, "Product discount deleted.")
})