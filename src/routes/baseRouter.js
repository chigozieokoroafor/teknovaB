const { Router } = require("express")
const  baseController = require("../controllers/baseController")


const base = Router()

base.post("/register", baseController.createAccount)
base.post("/login", baseController.login)
base.get("/verify", baseController.verify)




module.exports = {
    baseRouter: base
}