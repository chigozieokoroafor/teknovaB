
const { Op } = require("sequelize");
const { PARAMS } = require("../../util/consts");
const { category } = require("../models/category");

exports.createCategoryQuery = async(name, img_blob) =>{
    return await category.create(
        {name, img_blob}
    )
}

exports.checkCategoryExists = async(searchKeyword) =>{
    return await category.findOne(
        {
            where:{ 
                [PARAMS.name]: {
                    [Op.iLike]: `%${searchKeyword}%`
                }
            }
        }
    )
}

exports.fetchCategoryQuery = async() =>{
    return await category.findAll()
}