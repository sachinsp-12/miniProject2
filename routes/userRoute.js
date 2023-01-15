const express = require("express");
const user_route = express();

const nocache = require("nocache")
const auth = require("../middleware/auth");
const config = require("../config/config");

user_route.use(nocache());
user_route.use('/',express.static('public'));

let isLoggedin
isLoggedin = false
let userSession = false || {}



// // user_route.use(session({
//     secret: config.sessionSecret,
//     resave: true,
//     saveUninitialized: true
// }));



user_route.set("view engine", "ejs");
user_route.set("views","./views/users");

const userController = require("../controllers/userController");

user_route.get("/", userController.loadHome);
user_route.get("/home", userController.loadHome);
user_route.get("/register",auth.isLogout,userController.loadRegister)

user_route.get("/login",auth.isLogout, userController.loginLoad);

user_route.get("/shop",userController.loadShop);
user_route.get("/product-details",userController.productdetails);


user_route.get("/userProfile", auth.isLogin,userController.userProfile);
user_route.post("/userProfile",userController.addUserProfile);
user_route.get("/viewuserprofile", auth.isLogin,userController.loaduserprofile);
user_route.get("/deleteaddress", auth.isLogin,userController.deleteAddress);
user_route.post("/addAdress",userController.addAdress);
user_route.get("/editaddress",auth.isLogin,userController.editAddress);
user_route.post("/editaddress",userController.updateAddress);


user_route.get("/addtocart",auth.isLogin, userController.addToCart)
user_route.get("/cart",auth.isLogin,  userController.loadCart)
user_route.get("/addToWishlist", auth.isLogin, userController.addToWishlist)
user_route.get("/addToCartFromWishlist",auth.isLogin, userController.addToCartFromWishlist)


user_route.get("/wishlist", userController.loadWishlist)
user_route.get("/deletecart",userController.deletecart)
user_route.get("/deletewishlist",userController.deletewishlist)


user_route.get('/logout', auth.isLogin, userController.userLogout);


user_route.get("/checkout",auth.isLogin,userController.checkOut);
user_route.post("/payment",userController.storeOrder);
user_route.get("/success",userController.paymentSuccess);


user_route.get("/loadCategory",userController.loadCategory);

user_route.post("/add-coupon", userController.addCoupon)



user_route.get("/vieworder",auth.isLogin,userController.viewOrder);
user_route.get("/orderhistory",auth.isLogin,userController.orderHistory);
user_route.get("/deleteorder",userController.deleteOrder);
user_route.get("/returnorder",userController.returnOrder);

// user_route.get("/logout",auth.isLogin,userController.userlogout)

user_route.get('/verifyOtp', userController.loadOtp)
user_route.post('/verifyOtp', userController.verifyOtp)

// user_route.post("/applyCoupon",userController.applyCoupon)

user_route.post("/register",userController.insertuser);
user_route.post("/login",userController.verifyLogin);
user_route.post("/edit_Quantity",userController.edit_Quantity);
user_route.get("/getId",userController.getorderId);

module.exports = user_route;