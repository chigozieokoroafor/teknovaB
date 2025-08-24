const { conn } = require("./base")
const { user } = require("./models/user")
const { admin } = require("./models/admin")
const { cart } = require("./models/cart")
const { category, category_specifications } = require("./models/category")
const { images, product_images} = require("./models/images")
const { order } = require("./models/order")
const { product, product_specifications } = require("./models/product")
const { review } = require("./models/review")
const { shipping } = require("./models/shhipping")
const { transaction } = require("./models/transaction")

// const {} = require("./models/wishlist")

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
                // review.sync({alter:true}),
                // shipping.sync({alter:true}),
                // transaction.sync({alter:true})
                // category_specifications.sync({alter: true})
                // product_specifications.sync({alter: true})
                // product_specifications.sync({alter: true})
                // product_images.sync({alter: true})
                

            ]
        )
    })
}
