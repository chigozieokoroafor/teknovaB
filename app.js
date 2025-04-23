const express = require("express")
const cors = require("cors")
const { errorHandler } = require("./src/errorHandler/errorHandler")
const { success } = require("./src/errorHandler/statusCodes")
const { sync } = require("./src/db/sync")
const { createDatabaseIfNotExists } = require("./src/db/base")

const app = express()

app.use(cors())

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use("/", (req, res) => {
    success(res, {}, "Welcome to TekNova")
})


app.use(errorHandler)

const port = process.env.PORT ?? 3000



createDatabaseIfNotExists().then(()=> {
    sync().then(() => {
        app.listen(port, () => {
            console.log("running:::", port)
        })
    }).catch((error) => {
        console.log("unable to sync")
        console.log(error)
    })
}).catch((db_create_error) =>{
    console.log("unable to createDb:::")
    console.log(db_create_error)
})