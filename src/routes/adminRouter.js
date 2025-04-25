const { Router } = require("express")
const  adminController = require("../controllers/adminController")


const admin = Router()


admin.post("/login", adminController.login)




module.exports = {
    adminRouter: admin
}