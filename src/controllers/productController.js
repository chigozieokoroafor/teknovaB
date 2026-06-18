const { Sequelize, Op } = require("sequelize");
const {
    checkCategoryExists,
    createCategoryQuery,
    fetchCategoryQuery,
    deleteCategory,
    fetchCategoryById,
    updateSpecificCategory,
    updateDifferentCategory,
    fetchOrderedCategoryForHomeQuery,
    fetchParentCategoryQuery,
    fetchSingleCategory,
    // createCategorySpecification 
} = require("../db/querys/category");
const { uploadProduct, getProductsByCategory, getspecificProduct, searchProduct, deleteProductQuery, uploadProductImages, deleteProductImages, updateProductDetails, getNewProducts, deleteDiscountToProductRecord, addDiscountToProductRecord, getProductsWithoutDiscount, getDiscountedProducts, getProductsByCategoryTree, createProductVariants } = require("../db/querys/products");
const { catchAsync } = require("../errorHandler/allCatch");
const { generalError, success, notFound } = require("../errorHandler/statusCodes");
const { createUUID, sendEmail, baseValidator } = require("../util/base");
const { FETCH_LIMIT, PARAMS, MODEL_NAMES } = require("../util/consts");
const { categoryCreationSchema, categoryUpdateSchema, categoryOrderSchema } = require("../util/validators/categoryValidator");
const { productUploadSchema, productUpdateSchema } = require("../util/validators/productsValidator");
const { getTopProductCounts } = require("../db/querys/cart");
const { discountValidator } = require("../util/validators/couponValidator");
const { conn } = require("../db/base");

// admin category 
exports.createCategory = catchAsync(async (req, res) => {

    const error = baseValidator(categoryCreationSchema, req.body, res)
    if (error) {
        return error
    }

    let data = req.body

    console.log("data ====> ", data)

    // const specifications = data.specifications

    const cat_exists = await checkCategoryExists(req.body?.name)

    console.log(cat_exists)
    if (cat_exists) {
        return generalError(res, `Category "${req.body?.name}" exists`)
    }

    // const cat_id = category.uid
    // specifications?.map((item, index) => {
    //     // item[PARAMS.categoryId] = cat_id
    //     item[PARAMS.values] = item[PARAMS.values].split(",")
    //     specifications[index] = item
    // })

    // data[PARAMS.category_specifications] = data.specifications
    data["uid"] = `CAT_${createUUID()}`

    const category = await createCategoryQuery(data)

    return success(res, {}, "Category Created")

})

exports.fetchCategories = catchAsync(async (req, res) => {
    const { page, limit } = req.query

    let page_ = 1

    if (page <= 0 || !Number.isNaN(Number(page))) {
        page_ = Number(page)
        // return generalError(res, "Page cannot be less than 1")
    }
    let offset = 10
    let skip = 0

    if (limit) {
        offset = Number(limit)
    }

    skip = (Number(page_) - 1) * offset

    const data = await fetchCategoryQuery(Number(offset), Number(skip))
    return success(res, data, "Fetched")
})

exports.fetchSingleCategoryController = catchAsync(async (req, res) => {
    const { id } = req.params



    data = await fetchSingleCategory(id)
    return success(res, data, "Fetched")
})

exports.fetchParentCategories = catchAsync(async (req, res) => {
    const { page, limit } = req.query

    let page_ = 1

    if (page <= 0 || Number.isNaN(Number(page))) {
        page_ = Number(page)
        // return generalError(res, "Page cannot be less than 1")
    }
    let offset = 10
    let skip = 0

    skip = (Number(page_) - 1) * offset

    const data = await fetchParentCategoryQuery(Number(limit || offset), Number(skip))

    return success(res, data, "Fetched")
})

exports.fetchCategoriesForHome = catchAsync(async (req, res) => {
    const { page, limit } = req.query

    let page_ = 1

    if (page <= 0 || Number.isNaN(Number(page))) {
        page_ = Number(page)
    }
    let offset = 10
    let skip = 0

    if (limit) {
        offset = Number(limit)
    }

    skip = (Number(page_) - 1) * offset

    const data = await fetchOrderedCategoryForHomeQuery(Number(limit || offset), Number(skip))
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

    console.log("body::::", req.body)

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

exports.updateCategoryOrder = catchAsync(async (req, res) => {
    const error = baseValidator(categoryOrderSchema, req.body, res)
    if (error) {
        return error
    }

    console.log("body ====> ", req.body)

    // req.body.categories.forEach(async (cat_order) => {
    //     await updateDifferentCategory({ [PARAMS.sortOrder]: cat_order.sortOrder }, { sortOrder: null })

    //     await updateSpecificCategory(cat_order.uid, { sortOrder: cat_order.sortOrder })
    // })

    for (const cat_order of req.body.categories) {
        await updateDifferentCategory({ [PARAMS.sortOrder]: cat_order.sortOrder }, { sortOrder: null })

        await updateSpecificCategory(cat_order.uid, { sortOrder: cat_order.sortOrder })
    }

    success(res, {}, "Orders have been sorted.")

})

// admin products
exports.addProducts = catchAsync(async (req, res) => {


    console.dir(req.body, { depth: 12 })

    const error = baseValidator(productUploadSchema, req.body, res)

    if (error) {
        return
    }

    const category = await fetchCategoryById(req.body.categoryId)

    if (!category) {
        return notFound(res, "Category selected not found")
    }

    // const transaction = await conn.transaction()

    try {

        const productPayload = {
            uid: "PRD-" + createUUID(),
            name: req.body.name,
            categoryId: req.body.categoryId,
            discount: req.body.discount ?? 0,
            description: req.body.description,
            parentCategoryId: category.parentId,
            [MODEL_NAMES.product_specifications]: req.body.specifications
        }

        const product = await uploadProduct(productPayload)

        const imagesPayload = (req.body.images || []).map((img) => ({
            productId: product.uid,
            imageId: img
        }))

        if (imagesPayload.length > 0) {
            await uploadProductImages(imagesPayload)
        }

        const variantsPayload = (req.body.variants || []).map((variant) => ({
            ...variant,
            uid: "PRD-VAR-" + createUUID(),
            productId: product.uid,
            // specifications: variant.specifications
        }))

        if (variantsPayload.length > 0) {
            await createProductVariants(variantsPayload)
        }

        return success(res, {}, "Product uploaded successfully")

    } catch (error) {

        // await transaction.rollback()

        console.log("errorrrrrrrrr==== >", error)

        // sendEmail(
        //     "Error on product upload",
        //     "okoroaforc14@gmail.com",
        //     String(error)
        // ).catch(console.error)

        // return generalError(
        //     res,
        //     "Unable to add product at current time.",
        //     {}
        // )
    }
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

    const { t, h, l, sub } = req.query // t-> text, h-> high, l-> low, sub -> subCategory

    const s_q = {
        [Op.and]: [
            {
                [Op.or]: [
                    { categoryId: category_id },
                    { [PARAMS.parentCategoryId]: category_id }
                ]
            }
        ]

    }

    if (sub) {
        s_q[Op.and].push(
            {
                categoryId: sub,
            }
        )
    }

    if (t) {
        s_q[Op.and].push(
            {
                [Op.or]: [
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
        )
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
    const { category, search, h, l, page, subcategory } = req.query

    if (page <= 0 || !page) {
        return generalError(res, "Page cannot be less than 1")
    }

    const offset = (Number(page) - 1) * FETCH_LIMIT
    // let category_query = {}
    // const query_list = []
    let product_query = {}

    if (search) {
        // query_list.push(Sequelize.literal(`MATCH (${PARAMS.name}) AGAINST("${search}" IN BOOLEAN MODE)`),)
        product_query[PARAMS.name] = {
            [Op.like]: `%${search}%`
        }
    }
    if (h && l) {

        product_query["variants"] = {
            some: {
                price: { [Op.between]: [Number(l), Number(h)] }
            }
        }

        // product_query[PARAMS.price] = {
        //     [Op.between]: [Number(l), Number(h)]
        // }
    }

    let data


    if (category && !subcategory) {

        data = await getProductsByCategoryTree(category, product_query)
    }
    if (category && subcategory) {
        // product_query[PARAMS.parentId] = category
        product_query[PARAMS.categoryId] = subcategory

    }

    // console.dir(product_query, {depth: 12})

    if (!data) {

        data = await searchProduct(product_query, offset, FETCH_LIMIT)
    }


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

    return success(res, {}, "Product discount deleted.")
})

exports.getAllProductsDiscount = catchAsync(async (req, res) => {
    const page = req.query?.page

    if (page <= 0 || Number.isNaN(Number(page))) {
        return generalError(res, "Page cannot be less than 1")
    }
    const offset = (Number(page) - 1) * FETCH_LIMIT

    const { discount } = req.query

    let products

    if (discount || discount == "false") {
        if (discount == "false") {
            products = await getProductsWithoutDiscount(offset, FETCH_LIMIT)
        } else {
            products = await getDiscountedProducts({}, offset, FETCH_LIMIT)
        }
    } else {
        products = await searchProduct({}, offset, FETCH_LIMIT)
    }

    return success(res, products, "Fetched")
})