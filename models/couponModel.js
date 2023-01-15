const mongoose = require('mongoose')
// const User = require('./userModel');


const couponSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    
    discount:{
        type:Number,
        required:true
    },
    isavailable:{
        type:Number,
        default:0,
        required:true
    },
    usedBy:[{
        type:mongoose.Types.ObjectId,
        ref:'User'
    }]
})

module.exports = mongoose.model('Coupon',couponSchema)


