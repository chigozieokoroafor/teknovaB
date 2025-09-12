const { Router } = require("express")
const adminController = require("../controllers/adminController")
const productController = require("../controllers/productController")
// const  adminController = require("../controllers/adminController")
const { multipleuploadMiddleWare } = require("../middleware/upload")
const { adminAuth } = require("../middleware/auth")


const admin = Router()


admin.post("/login", adminController.login)
admin.get("/metric", adminAuth, adminController.metrics)
admin.get("/transactions", adminAuth, adminController.getRecentTransactions)
admin.get("/top/products", adminAuth, adminController.getTopProducts)

admin.post("/category", adminAuth, productController.createCategory)
admin.get("/category", productController.fetchCategories)
admin.get("/category/:category_id", productController.fetchProductsUnderCategory)
admin.delete("/category/:category_id", adminAuth, productController.deleteCategory)
admin.put("/category/:category_id", adminAuth, productController.updateCategory)

admin.get("/product", adminAuth, productController.getAllProducts)
admin.get("/product/:product_id", adminAuth, productController.getSpecificProduct)
// admin.put("/product/:product_id", adminAuth, productController.updateCategory)

admin.post("/product", adminAuth, productController.addProducts)
admin.delete("/product", adminAuth, productController.deleteProducts)

// images
admin.get("/images",
    //  adminAuth, 
    adminController.getImages)

admin.post("/images",
    adminAuth, 
    multipleuploadMiddleWare,
    adminController.uploadImages
)

admin.delete('/images/:id', adminAuth, adminController.deleteImages)


// orders
admin.get("/orders", adminAuth, adminController.getOrders)

admin.put("/orders", adminAuth, adminController.updateStatusOfOrders)




module.exports = {
    adminRouter: admin
}
