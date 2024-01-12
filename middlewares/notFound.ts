import express from 'express';
export default (req:express.Request , res:express.Response , next:express.NextFunction) => {
    res.status(404).json({message: 'Page not found !!'})
}