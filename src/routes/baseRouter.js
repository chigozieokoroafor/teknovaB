const { Router } = require("express")
const  baseController = require("../controllers/baseController")
const productController = require("../controllers/productController")

const base = Router()

base.post("/register", baseController.createAccount)
base.post("/login", baseController.login)
base.get("/verify", baseController.verify)
base.get("/category",productController.fetchCategories)
base.get("/category/:category_id", productController.fetchProductsUnderCategory)
base.get("/product/:product_id", productController.getSpecificProduct)
base.get("/products", productController.getAllProductsWithFilter)



module.exports = {
    baseRouter: base
}