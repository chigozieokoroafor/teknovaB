const { Router } = require("express")
const  adminController = require("../controllers/adminController")
const { uploadMiddleWare } = require("../middleware/upload")


const admin = Router()


admin.post("/login", adminController.login)


admin.post("/products", uploadMiddleWare, adminController.addProducts)



module.exports = {
    adminRouter: admin
}
