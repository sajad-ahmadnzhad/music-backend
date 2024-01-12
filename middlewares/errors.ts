import express from 'express';
export default (err:any , req:express.Request , res:express.Response , next:express.NextFunction) => {
    if (err) {
        const statusCode = err.status || err.statusCode || err.status || 500
        const errorMessage = err.message || "Server Error !!"
        res.status(statusCode).json({errorMessage})
    }
}