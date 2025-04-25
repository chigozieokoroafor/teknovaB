const express = require("express")
const cors = require("cors")
const { errorHandler } = require("./src/errorHandler/errorHandler")
const { success } = require("./src/errorHandler/statusCodes")
const { sync } = require("./src/db/sync")
const { createDatabaseIfNotExists } = require("./src/db/base")
const { baseRouter } = require("./src/routes/baseRouter")
const { adminRouter } = require("./src/routes/adminRouter")

const app = express()

app.use(cors())

app.use(express.json())
app.use(express.urlencoded({ extended: true }))


app.use("/api", baseRouter)
app.use("/admin", adminRouter)

app.use("/", (req, res) => {
    success(res, {}, "Welcome to TekNova")
})


app.use(errorHandler)

const port = process.env.PORT ?? 3000



createDatabaseIfNotExists().then(() => {
    sync().then(() => {
        app.listen(port, () => {
            console.log("running:::", port)
        })
    }).catch((error) => {
        console.log("unable to sync")
        console.log(error)
    })
}).catch((db_create_error) => {
    console.log("unable to createDb:::")
    console.log(db_create_error)
})