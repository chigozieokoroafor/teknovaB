const { Router } = require("express")
const  adminController = require("../controllers/adminController")
const  productController = require("../controllers/productController")
const { uploadMiddleWare } = require("../middleware/upload")


const admin = Router()


admin.post("/login", adminController.login)

admin.post("/category",productController.createCategory)
admin.get("/category",productController.fetchCategories)
// base.get("/category/:category_id", productController.fetchProductsUnderCategory)
// base.get("/product/:product_id", productController.getspecificProduct)

admin.post("/products", productController.addProducts)



module.exports = {
    adminRouter: admin
}
