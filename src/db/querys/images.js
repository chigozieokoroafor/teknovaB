const { Op } = require("sequelize");
const { images } = require("../models/relationships");

exports.uploadBulkImages = async (data) => {
    return await images.bulkCreate(data)
}


exports.fetchImages = async (limit, offset) => {
    return await images.findAll(
        {
            limit,
            offset
        }
    )
}

exports.fetchSingleImage = async (id) => {
    return await images.findOne({ where: { id } })
}

exports.deleteImage = async (id) => {
    return await images.destroy(
        {
            where: {
                id
                
            }
        }
    )
}