import express from 'express';
import categoryParent from './../models/categoryParent'
//category parent
export let getAllParent = async(req:express.Request, res:express.Response) => {
    const categories = await categoryParent.find().lean().select('-__v')
    res.json(categories)
}

export let createParent = (req:express.Request, res:express.Response) => {
    
}





//category