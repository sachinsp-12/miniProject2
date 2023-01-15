const User = require("../models/userModel");
// const bcrypt = require("bcrypt") 
const Product = require("../models/productModel");
const Order = require("../models/orderModel");
const Coupon = require("../models/couponModel");
// const Cart = require("../models/cartModel");
const bcrypt = require('bcrypt')
// const auth = require("../middleware/auth");
const  mongoose = require('mongoose')
const fast2sms = require("fast-two-sms")
const Razorpay = require('razorpay')

let isLoggedin = false;
let newUser 
let newOtp
let session;

let offer = {
  name: 'None',
  discount: 0,
  usedBy: false,
};
let couponTotal = 0;
let nocoupon=false
let offerapplied = false

const securePassword = async (password) => {
  try {
      const passwordHash = await bcrypt.hash(password, 10);
      return passwordHash;
  }
  catch (error) {
      console.log(error.message)
  }
}

// const userlogout = async(req,res)=>{
//   try {
//     req.session.user_id = null;
//     res.redirect('login')
// }
// catch (error) {
//     console.log(error.message)
// }
// }


const loadRegister = async (req, res) => {
  try {
    
    res.render("registration");
  } catch (error) {
    console.log(error.message);
  }
};

const sendMessage = function(mobile,res){
  let randomOTP = Math.floor(Math.random()*10000)
  var options = {
      authorization:"MSOj0bTnaP8phCARmWqtzkgEV4ZN2Ff9eUxXI7iJQ5HcDBKsL1vYiamnRcMxrsjDJboyFEXl0Sk37pZq",
      message:`your OTP verification code is ${randomOTP}`,
      numbers:[mobile]
  }
  //send this message
  fast2sms.sendMessage(options)
  .then((response)=>{
      console.log("otp sent successfully")
  }).catch((error)=>{
      console.log(error)
  })
  return randomOTP;
}
const loadOtp = async(req,res)=>{
  const userData = await User.findById({_id:newUser})
  const otp = sendMessage(userData.mobile,res)
  newOtp = otp
  console.log('otp:',otp);
  res.render('../otpVerify',{otp:otp,user:newUser})
}
const verifyOtp = async(req,res)=>{
  try{
      const otp = newOtp
      const userData = await User.findById({_id:req.body.user})
      if(otp == req.body.otp){
          userData.isVerified = 1
          const user = await userData.save()
          if(user){
              res.redirect('/login')
          }
      }else{
          res.render('../otpVerify',{message:"Invalid OTP"})
       }
  
      } catch(error){
          console.log(error.message)
       }
      }

const userProfile = async(req,res)=>{
           try {
            res.render("userProfile",{Address:null})
           } catch (error) {
             console.log(error)
           }
      }

const editAddress = async(req,res)=>{
  try {
    console.log("editing starts  "+req.query.id)
    const userdata = await User.findById({_id:req.session.userId})
    const addressData = await userdata.populate('Address.item')
    // console.log("addressData-----"+addressData)
    const addressdata = addressData.Address.item
    // console.log("addressdata----- "+addressdata)
    
    for(let key of addressdata){
        if(key._id==req.query.id){
          console.log(key)
          res.render("userProfile",{Address:key,addressId:key._id})
        }
    }  
  }
   catch (error) {
    console.log(error)
  }
   
  }

const updateAddress = async(req,res)=>{
  try {
    const userData =await User.findById({ _id:req.session.userId })
    const adressData = await userData.populate('Address.item')
    const addressdata = adressData.Address.item
    console.log("address update starts  "+addressdata)
 


  } catch (error) {
    console.log(error)
  }
}







const addUserProfile = async(req,res)=>{
      console.log("add user profile")
      try {
        const userData =await User.findById({ _id:req.session.userId })

        const addressdetails={
          name:req.body.name,
          country:req.body.country,
          address:req.body.address,
          state:req.body.state,
          postcode :req.body.postcode,
          phone:req.body.phone,
          email:req.body.email,
        }
        userData.addToAddress(addressdetails)

        const userdata = await User.findById({_id:req.session.userId})
        const adressData = await userdata.populate('Address.item')
        const addressdata = adressData.Address.item

         res.render("viewuserprofile",{user:addressdetails , addressdata:addressdata})
      } catch (error) {
        console.log(error)
      }

}


const addAdress = async(req,res)=>{
  console.log("add adress start")
  try {
    const userData =await User.findById({ _id:req.session.userId })
    const addressdetails={
      name:req.body.name,
      country:req.body.country,
      address:req.body.address,
      state:req.body.state,
      postcode :req.body.postcode,
      phone:req.body.phone,
      email:req.body.email,
    }
    userData.addToAddress(addressdetails)

    const userdata = await User.findById({_id:req.session.userId})
    const adressData = await userdata.populate('Address.item')
    const addressdata = adressData.Address.item

     res.redirect("/checkout")
  } catch (error) {
    console.log(error)
  }

}

const deleteAddress = async(req,res,next)=>{
  try {
    const addressId = req.query.id; 
    const userdata = await User.findById({_id:req.session.userId})
    userdata.removefromAddress(addressId)
  res.redirect('/viewuserprofile')
  } catch (error) {
    console.log(error)
  }
   
}



const loaduserprofile = async(req,res)=>{
        if(req.session.userId){
          const userdata = await User.findById({_id:req.session.userId})
          const adressData = await userdata.populate('Address.item')
         const addressdata = adressData.Address.item
          res.render("viewuserprofile",{user:adressData , addressdata:addressdata})
        }
       else{
        res.redirect("/login");
       }
}

const insertuser = async (req, res) => {

  const userData = await User.findOne({ email:req.body.email});
  if(userData){
    res.render('registration', { message: 'already a user'} )
  }
  else{
    const spassword = await securePassword(req.body.password);    
      try {      
        const user = new User({
        name: req.body.name,
        email: req.body.email,
        mobile: req.body.mno,
        password:spassword,
        is_admin: 0,
        is_blocked:0,
      
      });
      const userData = await user.save();
      newUser = userData._id
      if (userData) {   
        res.redirect("/verifyOtp");
      } else {
        res.render("registration");
      }
    } catch (error) {
      console.log("error1");
    }
  }
   
  };

const loginLoad = async (req, res) => {
  try {   
    res.render("login");
  } catch (error) {
    console.log(error);
  }
};

const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password
    // const spassword = await securePassword(req.body.password);
    const userData = await User.findOne({ email: email });   
   
      if (userData) {
        if(userData.is_blocked==0){
        const passwordMatch = await bcrypt.compare(password, userData.password)
           if (passwordMatch) {                 
          req.session.userId=userData._id
          
           isLoggedin = true
           userSession = req.session
          res.redirect("/home");
          console.log(" succesfully logged in")
         
        } else {
          res.render("login", { message: " Incorect password" });
        }
      }  else{
        res.render('login',{message:" Your account has been blocked"})
      }
    } 
    else {
      res.render("login", { message: "User does not exist please register" });
    }   
   
  } catch (error) {
    console.log(error.message);
  }
};


const userLogout = async(req,res)=>{
 try {

  
  userSession = req.session
  if(userSession){
    userSession.userId = null
    isLoggedin = false
    console.log("logged out");
    res.redirect('/')
  }
  else{
    res.redirect("/")
  }
 
  
 } catch (error) {
  
 }

}

const loadHome = async (req, res) => {
  try {
    console.log("home page loaded")
    session = req.session;
    session.offer = offer;
    session.couponTotal = couponTotal;
    session.nocoupon = nocoupon;
    res.render("home",{isLoggedin});
    
  } catch (error) {
    console.log(error);
  }
}; 


const loadShop = async(req,res)=>{

  try{
    const productData = await Product.find({isavailable:0} )
    res.render('shop',{product:productData})
  }
  catch(error){
    console.log(error.message)
  }
}
const productdetails = async(req,res)=>{
    
  try {
    const productData = await Product.findById({_id:req.query.id}).exec(async function(err,productData){
      if(productData){
        res.render("productdetails",{product:productData})
      }
      else if(err){
        res.redirect('*')
      }

    })

  } catch (error) {
    console.log(error)
  }
}


const addCoupon = async (req, res) => {
  console.log("add coupon starts")
  try {
    session = req.session;
    if (session.userId) {
      const userData = await User.findById({ _id: session.userId });
      const offerData = await Coupon.findOne({ name: req.body.offer });
      if (offerData) {
        if (offerData.usedBy.includes(session.userId)) {
          nocoupon = true;

          res.redirect('/checkout');
        } else {
          nocoupon = false
          session.offer = offerData
          let updatedTotal =
            userData.cart.totalPrice -
            (userData.cart.totalPrice * session.offer.discount) / 100;
            console.log("updated total  "+updatedTotal)
           
          session.couponTotal = updatedTotal;
          res.redirect('/checkout');
        }
      } else {
        res.redirect('/checkout');
      }
    } else {
      res.redirect('/checkout');
    }
  } catch (error) {
    console.log(error);
  }
};



const loadCart = async(req,res)=>{
  console.log("cart page loading")
  
  try {
      userSession = req.session
      if(userSession.userId){
        
        const userData =await User.findOne({ _id:userSession.userId })
        const products = userData.cart.item
        const completeUser = await userData.populate('cart.item.productId')
        console.log("complteuser "+completeUser.cart.item)
        for(let key in completeUser.cart.item){
          console.log(key.productId);
        }

        res.render('cart',{isLoggedin,id:userSession.userId,cartProducts:completeUser.cart})
      }
      else{
        res.redirect("/login");
      }
      }
      
           catch (error) {
      console.log(error);
  }
}
const addToCart = async(req,res,next)=>{
  try {
    
    const productId = req.query.id
    console.log(productId)
  
    userSession = req.session
    console.log(userSession)
    console.log(userSession.userId)
     if(userSession.userId){
      const productData =await Product.findById({ _id:productId })
    console.log("product data ")
    console.log(productData)
    console.log("user session")
    console.log(userSession.userId)
  
  
    // console.log(req.session.user_Id)
    const userData =await User.findById({_id:userSession.userId})
    console.log('userData')
    console.log(userData)
    
   await userData.addToCart(productData)
    res.redirect('/cart')
     } 
     else{
      res.redirect("/login" )
      
     }
    
    
  } catch (error) {
    console.log(error)
  }
 
  }

  const addToCartFromWishlist = async(req,res,next)=>{
    try {
      
      const productId = req.query.id
      console.log("addToCartFromWishlist")
      console.log(productId)
    
      userSession = req.session
      console.log(userSession)
       if(userSession){
        
        const productData =await Product.findById({ _id:productId })
      console.log("product data")
      console.log(productData)
      console.log("user session")
      console.log(userSession.userId)
    
    
      // console.log(req.session.user_Id)
      const userData =await User.findById({_id:userSession.userId})
      console.log('userData')
      console.log(userData)
      
    const addcart =  userData.addToCart(productData)
    if(addcart){
      userData.removefromWishlist(productId)
    }
      res.redirect('/cart')
      } 
       else{
        res.redirect("/login")
       }
      
      
    } catch (error) {
      console.log(error)
    }
   
    }


const loadWishlist = async(req,res)=>{
  console.log("cart page loading")
  try {
      userSession = req.session
      console.log(userSession)
      console.log(userSession)
        console.log(userSession.userId)
      if(userSession.userId){
        
        const userData =await User.findById({ _id:userSession.userId })
        console.log('userData')
        // console.log(userData)
        console.log("wishlist------"+userData.wishlist.item)
       const produts = userData.wishlist.item
       console.log("heloooo-----"+produts.length)
      //  for(let i=0;i<produts.length;i++){
      //       console.log("pro-------"+produts[i].productId)
      //  }
        // console.log(userData.cart.productId)
        // console.log('completeUser') 
        const completeUser = await userData.populate('wishlist.item.productId')
        
        console.log("complete user ------"+completeUser)
        console.log("complete user. wishlist ------"+completeUser.wishlist)
        console.log("complete user. wishlist . item ------"+completeUser.wishlist.item)
        const completeUsers = await userData.populate('wishlist.item')
        console.log("complete usersss ------"+completeUsers)
        res.render('wishlist',{isLoggedin,id:userSession.userId,cartProducts:completeUser.wishlist})
      }
      else{
        res.redirect("/login")
      }
      }
      
           catch (error) {
      console.log(error);
  }
}

// const loadCart = async(req,res)=>{
//   try {
//     userSession = req.session
//     if( userSession.userId){
//       const cart = await Cart.find( )
    
//        res.render("cart",{C:cart})
//        console.log("user loged in cart loaded")
//     }
//     else{
//       console.log("user not logged in")
//       res.redirect("/login")
//     }
    

//   } catch (error) {
//     console.log(error)
//   }
// } 
  const addToWishlist = async (req,res)=>{
    try {
      console.log("addto wishlist loaded")
      const productId = req.query.id
      console.log("productId")
    console.log(productId)
  
    userSession = req.session
    console.log(userSession)
     if(userSession){
      
      const productData =await Product.findById({ _id:productId })
    console.log("product data")
    console.log(productData)
    console.log("user session")
    console.log(userSession.userId)
    const userData =await User.findById({_id:userSession.userId})
    console.log('userData')
    console.log(userData)
    
    userData.addToWishlist(productData)
    console.log("wishlist loading")
    res.redirect('/wishlist')
     } 
     else{
      res.redirect("/login")
     }


    } catch (error) {
      console.log(error)
    }
  }
  
  




// const addToCart = async(req,res,next)=>{
//   const productId = req.query.id
//   // userSession = req.session
//   // const userData =await User.findById({_id:userSession.userId})
//   const productData =await Product.findById({ _id:productId })
//   req.user.addToCart(productData)
//   res.redirect('/')
// }

// const addtocart = async (req,res)=>{
//   console.log(req.query.id)
//   const productId = req.query.id
//   userSession = req.session
//   try {
//       const productData = await Product.findById({_id:req.query.id}) 
//      console.log(productData)
//      console.log(productData.product_name)
//     if(req.session.id){
//       console.log("auth checked")
//       const cart = new Cart({
//         product_name: productData.product_name,
//         price:productData.price,
//         image:productData.image
 
       
//       });
 
//       // console.log(cart)
 
//       const cartData = await cart.save();
//       // console.log(cartData)
//       const C = await Cart.find( )
//       console.log(C)
 
//         res.render("cart",{C:C})
       
     
//    }
//    else{
//     res.render("login")
//    }
//     }
//       catch (error) {
//     console.log(error)
//   }
// }
      // product_name: productData.product_name,
      // price:productData.price,
      // image:productData.image
           
      const deletecart = async(req,res,next)=>{
        console.log("delete cart begins")
        const productId = req.query.id       
        const userData = await User.findById({_id:req.session.userId})
        console.log(userData)
        userData.removefromCart(productId)
        res.redirect('/cart')
    }
  
    const deletewishlist = async(req,res,next)=>{
      const productId = req.query.id
      userSession = req.session
      const userData = await User.findById({_id:userSession.userId})
      userData.removefromWishlist(productId)
      res.redirect('/wishlist')
  }

// const deletecart = async(req,res)=>{
//   const cartdata=req.query.id;
//   console.log(cartdata)
//   userSession = req.session
//   console.log("usersession.userid    "+userSession.userId)

//   try {
    
//      console.log(cartdata)
//       const deleteproduct = await  User.cart.deleteOne({_id:cartdata})
//     console.log(deleteproduct)
//     res.redirect("/cart")

//   } catch (error) {
//     console.log(error)
//   }
// }
const edit_Quantity = async(req,res)=>{

  console.log("edit quantity starts")
  try {
    console.log("The id"+req.body.id)
   const id= req.body.id
    console.log(req.body.quantity)
    const quantity=Number(req.body.quantity)
    userSession = req.session;
    const userData =await User.findById({_id:userSession.userId})
    console.log(userData.name)
    console.log("quantity change")
    console.log(userData)
    const foundProduct = userData.cart.item.findIndex(objInItems => objInItems._id == id)
    console.log('product found at: ',foundProduct)
    console.log(req.body.quantity)
    userData.cart.item[foundProduct].qty = quantity
   console.log(userData.cart.item[foundProduct].qty) 
    console.log(userData.cart.item[foundProduct]);
    userData.cart.totalPrice = 0
    console.log("hiii")
    const totalPrice = userData.cart.item.reduce((acc,curr)=>{
        return acc+(curr.price * curr.qty)
    },0)
    console.log(totalPrice)
    userData.cart.totalPrice = totalPrice
    await userData.save()
    console.log("came");
    res.send({"data":totalPrice})
  }
    catch (error) {
    console.log(error.message);
   }

}

const  checkOut = async(req,res)=>{
  console.log("checkout opens")
  try {
    const id = req.query.id
    userSession = req.session;
    if(userSession){
    console.log("coupon applied or not  "+session.offer)
    const userData =await User.findById({ _id:userSession.userId })
    const completeUser = await userData.populate('cart.item.productId')
    const adressData = await userData.populate('Address.item')

    if (session.couponTotal == 0) {
      //update coupon
      session.couponTotal = userData.cart.totalPrice;
    }
    const adreslen=adressData.Address.item.length
    if(adreslen>0){
         
      if(id>=0){
          res.render("checkout",{isLoggedin,
            id:userSession.userId,
            cartProducts:completeUser.cart,
            addreslength:adreslen,
            adress:adressData.Address,
            value:adressData.Address.item[id],
            nocoupon:nocoupon,
            offerapplied:session.offerapplied,
            offer:session.offer,
            couponTotal:session.couponTotal
          })
         }
         else{
          res.render("checkout",{
            isLoggedin,
            id:userSession.userId,
            cartProducts:completeUser.cart,
            addreslength:adreslen,
            adress:adressData.Address,
            value:adressData.Address.item[0],
            nocoupon:nocoupon,
            offerapplied:session.offerapplied,
            offer:session.offer,
            couponTotal:session.couponTotal
          })
         }
    
    }
    else{
      res.render("checkout",{addreslength:adreslen,id:userSession.userId,cartProducts:completeUser.cart,offer:session.offer, couponTotal:session.couponTotal,nocoupon:nocoupon,})  
    }
  }
  else{
    res.redirect("/")
  }
  } 
  catch (error) {
    console.log(error)
  }
        
}

// const PostcheckOut = async (req,res)=>{
  
//     console.log("post checkout")
//     const userData =await User.findById({ _id:req.session.userId })
//     const completeUser = await userData.populate('cart.item.productId')
//     try {

    
//       const order=Order({
//         userId:req.session.userId,
//         name:req.body.name,
//         country:req.body.country,
//         address:req.body.address,
//         state:req.body.state,
//         postcode :req.body.postcode,
//         phone:req.body.phone,
//         email:req.body.email,
//         products:completeUser.cart
//       })
      
//       const orderData =  await order.save()
//       console.log("order 1")
//       console.log( orderData)
//       const userData =await User.findById({ _id:req.session.userId })

//       const addressdetails={
//         name:req.body.name,
//         country:req.body.country,
//         address:req.body.address,
//         state:req.body.state,
//         postcode :req.body.postcode,
//         phone:req.body.phone,
//         email:req.body.email,
//       }
//       userData.addToAddress(addressdetails)
  
//       // orderData.addToOrders(addressdetails)
//       res.redirect('/success')
//     }

  
//      catch (error) {
//       console.log(error)
//     }
    
//   }
  
const storeOrder = async (req, res) => {
  nocoupon=false
  try {
    console.log("order storing started")
    session = req.session;
    if (session.userId) {
      const offerapplied = req.body.offer;
      console.log(offerapplied)
      const userData = await User.findById({ _id: session.userId });
      console.log("adressssss"+userData)
      const completeUser = await userData.populate('cart.item.productId');
      const offerdata = await   Coupon.findOne({name:session.offer.name})
      console.log(completeUser.cart.totalPrice)
      console.log("fdgs    "+completeUser.cart)
      // console.log('CompleteUser: ', completeUser);
      userData.cart.totalPrice = session.couponTotal;
      const updatedTotal = await userData.save();
      
      if (completeUser.cart.totalPrice > 0) {
       
        const order = Order({

          userId: session.userId,
          country: req.body.country,
          name: req.body.name,
          
          address: req.body.address,         
          state: req.body.state,
          postcode: req.body.postcode,
          email: req.body.email,
          phone: req.body.phone,
          payment: req.body.payment,
          discount:session.offer.discount,
          offer:session.offer.name,
          products: completeUser.cart
        });
        let orderProductStatus = [];
        for (let key of order.products.item) {
          orderProductStatus.push(0);
        }
        // console.log('orderProductStatus',orderProductStatus);
        order.productReturned = orderProductStatus;

        const orderData = await order.save();
        console.log(orderData);
        session.currentOrder = orderData._id;
        // console.log('userSession.currentOrder',userSession.currentOrder);

        const userAdress =await User.findById({ _id:req.session.userId })

        const addressdetails={
          name:req.body.name,
          country:req.body.country,
          address:req.body.address,
          state:req.body.state,
          postcode :req.body.postcode,
          phone:req.body.phone,
          email:req.body.email,
        }
        userAdress.addToAddress(addressdetails)
        try {
          if(!offerdata.usedBy.includes(session.userId)){
            const offerUpdate = await Coupon.updateOne(
              { name: session.offer.name },
              { $push: { usedBy: session.userId } }
            );
           }
        } catch (error) {
          console.log("error")
        }
         
         
        
        
        console.log(orderData);
        // console.log(req.body.payment);
        // await orderData.save();
        if (req.body.payment === 'COD') {
          res.redirect('/success');
        // } else if (req.body.payment === 'PayPal') {
        //   const usTotal=(completeUser.cart.totalPrice)/80;
        //   console.log(usTotal);
        //   res.render('user/paypal', {
        //     userId: session.userId,
        //     total: usTotal.toFixed(2),
        //     count: userData.cart.totalqty,
        //     wcount: userData.wishlist.totalqty,
        //   });
        } else {
          res.redirect('/success');
        }
      } else {
        res.redirect('/checkout');
      }
    } else {
      res.redirect('/');
    }
  } catch (error) {
    console.log(error);
  }
};


const loadCategory = async (req,res)=>{
  console.log(" load category ")
  const category=req.query.id
  try {
      console.log("load category in")
      const productData =await Product.find({category:category})
      res.render("shop",{product:productData})
    
  } catch (error) {
    console.log(error)
  }

}

const paymentSuccess = async (req, res) => {
  console.log("payment success starts")
  try {
    session = req.session;
    if (session.userId) {
      const userData = await User.findById({ _id: session.userId });
      const productData = await Product.find();
      for (let key of userData.cart.item) {
        console.log(key.productId, ' + ', key.qty);
        for (let prod of productData) {
          if (new String(prod._id).trim() == new String(key.productId).trim()) {
            console.log(prod.stock)
            prod.stock = prod.stock - key.qty;
            console.log(prod.stock)
            await prod.save();
          }
        }
      }
      await Order.find({
        userId: session.userId,
      });
      await Order.updateOne(
        { userId: session.userId, _id: session.currentOrder },
        { $set: { status: 'CONFIRM' } }
      );
      console.log(session.currentOrder);
      await User.updateOne(
        { _id: session.userId },
        {
          $set: {
            'cart.item': [],
            'cart.totalPrice': '0',
            'cart.totalqty': '0',
            'cart.updatedPrice':'0'
          },
        },
        { multi: true }
      );
      console.log('Order Built and Cart is Empty.');
      session.couponTotal = 0;
      console.log("current order"+session.currentOrder)
      res.render('success',{orderId:session.currentOrder});
      // res.render('Success', {
      //   count: 0,
      //   wcount: userData.wishlist.totalqty,
      //   orderId: session.currentOrder,
      // });
    } else {
      res.redirect('/login');
    }
  } catch (error) {
    console.log(error);
  }
};


const viewOrder = async (req,res)=>{
  try {
    console.log("view order")
        usersession = req.session;
        console.log(usersession)
        console.log("order data query")
        console.log(req.query.id)
        const id = req.query.id
        if(usersession){
            const orderdata = await Order.findById({_id:id})
            const orderdata2 = await Order.find({userId:req.session.userId})
            const productdata = await orderdata.populate("products.item")
            const productData = productdata.products
            console.log("productdata"+productdata.products.item.length)
            const userData = await User.findById({ _id:usersession.userId });
            const completeUser = await orderdata.populate('products.item.productId')
            console.log("ordered products    "+ productdata.products)
            console.log("ordered user    "+userData)
            console.log("complete user    "+ completeUser)
            // for(let key in completeUser.products.item){
            //   console.log("key"+key.productId);
            // }

            // const image = await Product.findById({_id:productData.iproductId})
            // const userdata = await User.findById({_id:req.session.userId})
            // const adressData = await userdata.populate('Address.item')
            // const addressdata = adressData.Address.item
          
           
            res.render("vieworder",{orderitem:productData,order:productdata,cartproducts:completeUser.cart,id:usersession.userId})
        }
        else{
          res.redirect("/")
        }


  } catch (error) {
    console.log(error);
  }
}

const deleteOrder = async(req,res)=>{
  console.log(req.query.id)
  try {
    const delorder =await Order.findByIdAndUpdate({_id:req.query.id},{$set:{isavailable:1}})
    console.log("delorder////"+delorder)
    res.redirect("/orderhistory")
  } catch (error) {
    console.log(error);
  }
}
const returnOrder = async(req,res)=>{
  console.log(req.query.id)
  try {
    const returnorder =await Order.findByIdAndUpdate({_id:req.query.id},{$set:{status:"return"}})
    console.log("delorder////"+returnorder)
    res.redirect("/orderhistory")
  } catch (error) {
    console.log(error);
  }
}

const orderHistory = async(req,res)=>{
  console.log(" user order history")
  const orderdata = await Order.find({userId:req.session.userId})
  console.log(orderdata.length)
  res.render("orderhistory",{order:orderdata})

}


const getorderId = async (req,res)=>{
  console.log("entered");
  console.log(req.query.total);
    var instance = new Razorpay({ key_id: 'rzp_test_NGcaol52IYnJlE', key_secret: 'gkZTEBj16uIheoeMGeB8MTAb' })
  var id=instance.orders.create({
   amount: req.query.total,
   currency: "INR",
   receipt: "receipt#1",
}).then((data)=>{
  res.json(data)
})

}

module.exports = {
  loginLoad,
  insertuser,
  loadRegister,
  verifyLogin,
  loadHome,
  loadShop,
  productdetails,
  addToCart ,
  // userlogout,
  loadCart,
  deletecart,
  userLogout,
  edit_Quantity,
  checkOut,
  addToWishlist,
  loadWishlist,
  deletewishlist,
  addToCartFromWishlist,
  loadCategory,
  paymentSuccess,
  storeOrder,
  sendMessage,
  loadOtp,
  verifyOtp,
  userProfile,
  addUserProfile,
  loaduserprofile,
  addCoupon,
  viewOrder,
  orderHistory,
  deleteOrder,
  returnOrder,
  addAdress,
  deleteAddress,
  editAddress,
  updateAddress,
  getorderId,
};
