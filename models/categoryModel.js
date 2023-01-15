const mongoose = require("mongoose");
const Product = require('../models/productModel')

const categorySchema = new mongoose.Schema({
    
    
    
      category: {
        type: String,
        required: true,
      },
      isavailable:{
        default:0,
        type:Number,
        required: true,
      }
})


module.exports = mongoose.model("Category",categorySchema);
        
    //   products:{

    //     item:[{
           
    //         productId:{
    //             type:mongoose.Types.ObjectId,
    //             ref:'Product',
    //             required:true
    //         },
    //         name:{
    //             type:String
    //         } 
    //     }]
    // }
   

      


              
    

