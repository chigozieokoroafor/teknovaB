const { images } = require("../models/images");

exports.uploadBulkImages = async(data) =>{
    return await images.bulkCreate(data)
}


exports.fetchImages = async(limit, offset) =>{
    return await images.findAll(
        {
            limit,
            offset
        }
    )
}