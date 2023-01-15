const express = require("express");
const mongoose = require ("mongoose");
const User = require("./models/userModel");
const Product = require('./models/productModel')
const Category = require('./models/categoryModel')
const Banner = require('./models/bannerModel')
const Order = require('./models/orderModel')
const Coupon = require('./models/couponModel')
const session = require('express-session')
const config = require('./config/config')
const userRoute = require("./routes/userRoute");
const adminRoute = require("./routes/adminRoute");
const path = require('path')

const app = express();


const dbpath = require('./config/connection')
mongoose.connect("mongodb+srv://Sachin:Sachin123@cluster0.0ucfbbr.mongodb.net/?retryWrites=true&w=majority",()=>{
  console.log("Database Connected.");
})
 


// const session = require("express-session")



app.use(express.json())
app.use(express.urlencoded({extended:true}))
  

app.use(session({secret:config.sessionSecret}))

// for user route


userRoute.set('view engine','ejs')
userRoute.set('views','./views/users')
userRoute.use('/',express.static('public'))

userRoute.use(express.json())
userRoute.use(express.urlencoded({extended:true}))
app.use("/",userRoute);


// for admin route



adminRoute.set('view engine','ejs')
adminRoute.set('views','./views/admin')
adminRoute.use('/',express.static('public'))
adminRoute.use('/',express.static('public/admin'))
app.use("/admin",adminRoute);

app.get("*",function(req,res){
  res.status(404).render("404page.ejs");
})

app.listen(3000, function(){
    console.log("server is running");
});