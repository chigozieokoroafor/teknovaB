const { Router } = require("express")
const  adminController = require("../controllers/adminController")
const  productController = require("../controllers/productController")
// const  adminController = require("../controllers/adminController")
const { uploadMiddleWare, multipleuploadMiddleWare } = require("../middleware/upload")
const { adminAuth } = require("../middleware/auth")


const admin = Router()


admin.post("/login", adminController.login)
admin.get("/metric", adminAuth, adminController.metrics)
admin.get("/transactions", adminAuth, adminController.getRecentTransactions)
admin.get("/top/products", adminAuth, adminController.getTopProducts)

admin.post("/category", adminAuth, productController.createCategory)
admin.get("/category",productController.fetchCategories)
admin.get("/category/:category_id", productController.fetchProductsUnderCategory)
admin.delete("/category/:category_id", productController.deleteCategory)

admin.get("/product/:product_id", productController.getSpecificProduct)
admin.post("/product", adminAuth, productController.addProducts)
admin.delete("/product", adminAuth, productController.deleteProducts)

// images
admin.get("/images",
    //  adminAuth, 
     adminController.getImages)
admin.post("/images", 
    // adminAuth, 
    multipleuploadMiddleWare,
    adminController.uploadImages)


module.exports = {
    adminRouter: admin
}
