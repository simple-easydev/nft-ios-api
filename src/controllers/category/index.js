const { matchedData } = require('express-validator');

const { Sequelize } = require('sequelize');
const { Categories, SubCategory } = require("models/categories");
const Op = Sequelize.Op;

exports.create = async (req, res) => {

    const data = matchedData(req);
    try {

        let result = await Categories.create({ ...data });
        let newCate = result.get();
        if (data.parent_id > 0) {
            await SubCategory.create({ parent_id: data.parent_id, sub_id: newCate.id});    
        }

        res.status(200).json({ ...newCate });
    }catch(error){
        console.log(error);
        res.status(500).json({ error });
    }
}

exports.getAllCategories = async (req, res) => {

    const { type } = req.query;

    try {
        let categories = await Categories.findAll({
            where: { 
                parent_id: 0, 
                type: type
            },
            include: [
                {
                    model: Categories,
                    as: "Sub_Category",
                    through: {
                        model:SubCategory
                    },
                }
            ]
        });
        
        res.status(200).json({ categories });    
        
    }catch(error){
        console.log(error);
        res.status(500).json({ error });
    }
}

exports.update = async (req, res) => {

    const { id } = req.params
    const data = matchedData(req);

    try {
        let category = await Categories.findByPk(id);
        if (!category) {
            res.status(422).json({ "error": "Category doesn't exist" });
            return;
        }

        category.name = data.name;
        category.icon = data.icon;
        category.active = data.active;
        category.parent_id = data.parent_id;
        category.type = data.type;

        await category.save();

        if (data.parent_id > 0) {
            let subCategory = SubCategory.findOne({
                where: {sub_id: id}
            })
            if (subCategory) {
                subCategory.parent_id = data.parent_id;
                await subCategory.save();
            } else {
                await SubCategory.create({ parent_id: data.parent_id, sub_id: id});    
            }
        }

        res.status(200).json({ message:"success" });
    }catch(error){
        console.log(error);
        res.status(500).json({ error });
    }
}


exports.delete = async (req, res) => {
    const { id } = req.params;
    try {
        await Categories.destroy({ where: { id }});
        res.status(200).json({ message:"success" });
    }catch(err){
        console.log(err);
        res.status(401).json({ err });
    }
}