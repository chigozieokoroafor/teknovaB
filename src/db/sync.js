const { conn } = require("./base")
const { user } = require("./models/user")
const { admin } = require("./models/admin")
const { cart } = require("./models/cart")
const { category } = require("./models/category")
const { images, product_images} = require("./models/images")
const { order } = require("./models/order")
const { product, coupon, productDiscount } = require("./models/product")
const { extra_payments } = require("./models/review")
const { shipping } = require("./models/shhipping")
const { transaction } = require("./models/transaction")

exports.sync = async () => {

    conn.authenticate().then(async () => {
        await Promise.allSettled(
            [
                // user.sync({ alter: true }), // merge to main
                // admin.sync({ alter: true }),
                // cart.sync({ alter: true }), 
                // category.sync({ alter: true }),
                // images.sync({alter:true}),
                // order.sync({alter:true}),
                // product.sync({alter:true}),
                // extra_payments.sync({alter:true}),
                // shipping.sync({alter:true}),
                // transaction.sync({alter:true})
                // product_images.sync({alter: true})
                // coupon.sync({alter: true})
                // productDiscount.sync({alter: true})
            ]
        )
    })
}
