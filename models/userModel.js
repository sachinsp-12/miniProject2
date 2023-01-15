const mongoose = require("mongoose");
const Product = require('../models/productModel')
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  mobile: {
    type: Number,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  password2: {
    type: String,
  },
  is_admin: {
    type: Number,
    required: true,
  },
  is_blocked:{
    type:Number,
    required:true
  },
  
  cart:{
    item:[{
        productId:{
            type:mongoose.Types.ObjectId,
            ref:'Product',
            required:true
        }, 
        qty:{
            type:Number,
            required:true
        },
        price:{
            type:Number
        },
    }],
    totalPrice:{ 
        type:Number,
        default:0
    },
    totalqty: {
      type: Number,
      default: 0
    },
    updatedPrice:{
      type:Number,
      default:0
    }
},
wishlist:{
  item:[{
      productId:{
          type:mongoose.Types.ObjectId,
          ref:'Product',
          required:true
      },
      qty:{
          type:Number,
          required:true
      },
      price:{
          type:Number
      },
  }],
  totalqty: {
    type: Number,
    default: 0
  },
},
Address:{
  item:[{
      Name:{
          type:String,
          required:true
      },
      Country:{
          type:String,
          required:true
      },
      addres:{
          type:String,
          required:true
      },
      State:{
        type:String,
        required:true
    },Postcode:{
      type:Number,
      required:true
  },
  Phone:{
    type:Number,
    required:true
},
Email:{
  type:String,
  required:true
}
  }]
}
});

userSchema.methods.addToCart = function (product) {  const cart  = this.cart
  const isExisting = cart.item.findIndex(objInItems => {
      return new String(objInItems.productId).trim() == new String(product._id).trim()
  })
  if(isExisting >=0){
      cart.item[isExisting].qty +=1
  }else{
      cart.item.push({productId:product._id,name:product.name,
      qty:1,price:product.price, image:product.image})
  }
  console.log("schema add to cart"+cart.item)

  cart.totalPrice += product.price
  cart.totalqty += 1;
  console.log("User in schema:",this);
  return this.save()
}
userSchema.methods.addToWishlist = function (product) {
  const wishlist = this.wishlist
  const isExisting = wishlist.item.findIndex(objInItems => {
      return new String(objInItems.productId).trim() == new String(product._id).trim()
  })
  if(isExisting >=0){
    wishlist.item.pull({
      productId: product._id,
      qty: 1,
      price: product.price,
    });
    wishlist.totalqty -= 1;
     
  }else{
      wishlist.item.push({productId:product._id,name:product.name,
      qty:1,price:product.price})

      wishlist.totalqty +=1
  }
 
  console.log("User in schema:",this);
  return this.save()
}




userSchema.methods.addToAddress = function (a) { 
   const Address = this.Address
  const isExisting = Address.item.findIndex(objInItems => {
      return new String(objInItems.addres).trim() == new String(a.address).trim()
  })
  if(isExisting >=0){
      console.log("found--------",Address.item[isExisting].Name);
  }else{
      Address.item.push({Name:a.name,Country:a.country,State:a.state,
      addres:a.address,Postcode:a.postcode,Phone:a.phone,
    Email:a.email})
    }
  //     
  // }
  // cart.totalPrice += product.price
  console.log(" Adress ------------User in schema:",this);
  return this.save()
}



userSchema.methods.removefromCart =async function (productId){
  console.log("enteredcart-----------------"+productId);
  const cart  = this.cart
  const isExisting = cart.item.findIndex(objInItems => new String(objInItems.productId).trim() === new String(productId).trim())
  console.log(isExisting);
  if(isExisting >= 0){
      const prod = await Product.findById(productId)
      console.log("id--------------"+prod);
      cart.totalPrice -= prod.price * cart.item[isExisting].qty
      cart.totalqty -= cart.item[isExisting].qty;
      cart.item.splice(isExisting,1)
      console.log("User in schema:",this);
      return this.save()
  }
}
userSchema.methods.removefromAddress =async function (addressId){
  console.log("entered address-----------------"+addressId);
  const address  = this.Address
  const isExisting = address.item.findIndex(objInItems => new String(objInItems._id).trim() === new String(addressId).trim())
  console.log("isExisting or not");
  console.log(isExisting);
  console.log(address)
  if(isExisting >= 0){
      address.item.splice(isExisting,1)
      console.log("User in schema:",this);
      return this.save()
  }
}

userSchema.methods.removefromWishlist =async function (productId){
  console.log("enteredwishlist-----------------"+productId);
  const wishlist = this.wishlist
  const isExisting = wishlist.item.findIndex(objInItems => new String(objInItems.productId).trim() === new String(productId).trim())
  console.log(isExisting);
  if(isExisting >= 0){
      const prod = await Product.findById(productId)
      // cart.totalPrice -= prod.price * cart.item[isExisting].qty
      wishlist.totalqty -= wishlist.item[isExisting].qty;
      wishlist.item.splice(isExisting,1)
      console.log("User in schema:",this);
      return this.save()
      
  }
}
module.exports = mongoose.model("User", userSchema);
   
   
 

 