const { Router } = require("express")
const  adminController = require("../controllers/adminController")
const  productController = require("../controllers/productController")
const { uploadMiddleWare } = require("../middleware/upload")


const admin = Router()


admin.post("/login", adminController.login)


admin.post("/products", productController.addProducts)



module.exports = {
    adminRouter: admin
}
