const express = require("express");
const admin_route = express();
const session = require("express-session");
const config = require("../config/config");
const adminController = require("../controllers/adminController");
const adminauth = require("../middleware/adminAuth");
const nocache = require("nocache")
// const bodyParser = require("body-parser");

const path = require("path");
const multer = require("multer");
let Storage = multer.diskStorage({
    destination: "./public/assets/uploads/",
    filename: (req, file, cb) => {
        cb(
            null,
            file.fieldname+ "_" + Date.now() + path.extname(file.originalname)
        );
    },
});
let upload = multer({storage: Storage,})

admin_route.use(session({
    secret: config.sessionSecret,
    resave: true,
    saveUninitialized: true
}));

admin_route.use('/',express.static('public/admin'));
admin_route.use(nocache());
admin_route.set("view engine", "ejs");
admin_route.set("views","./views/admin");



admin_route.get("/",adminauth.isLogout,adminController.adminload);
admin_route.get("/home",adminauth.isLogin,adminController.adminhome);
admin_route.get("/dashboard",adminauth.isLogin,adminController.adminDashboard);


admin_route.get("/block-user",adminauth.isLogin,adminController.block_user);
admin_route.get("/unblock-user",adminauth.isLogin,adminController.unblock_user);
admin_route.get("/userProfile",adminauth.isLogin,adminController.user_Profile);


admin_route.get("/productlist",adminauth.isLogin,adminController.productlist);
admin_route.get("/addproduct",adminauth.isLogin,adminController.addproduct);
admin_route.get("/delete-product",adminauth.isLogin,adminController.deleteproduct);
admin_route.get("/retrieve-product",adminauth.isLogin,adminController.retrieveproduct);
admin_route.get("/editproduct",adminauth.isLogin,adminController.editproduct);
admin_route.get("/product-details",adminauth.isLogin,adminController.viewOrderProduct)
admin_route.get("/productDetails",adminauth.isLogin,adminController.viewProduct)

admin_route.get('/addbanner',adminauth.isLogin, adminController.addBanner);
admin_route.post(
    '/addbanner',
    upload.any(),
    adminController.getBanner,
  );

admin_route.get("/Category",adminauth.isLogin,adminController.loadCategory);
admin_route.get("/deleteCategory",adminauth.isLogin,adminController.deleteCategory);
admin_route.get("/showCategory",adminauth.isLogin,adminController.showCategory);

admin_route.get("/coupon",adminauth.isLogin,adminController.loadCoupon);
admin_route.post("/coupon",adminController.addCoupon);
admin_route.get("/deleteCoupon",adminController.deleteCoupon);
admin_route.get("/showCoupon",adminController.showCoupon);

admin_route.get("/orderhistory",adminauth.isLogin,adminController.orderHistory);
admin_route.get("/cancelorder",adminauth.isLogin,adminController.cancelOrder);
admin_route.get("/deliverorder",adminauth.isLogin,adminController.deliverOrder);

admin_route.get("/logout",adminauth.isLogin,adminController.logout);

// admin_route.get('/banners', adminauth.isLogin, adminController.loadAdminBanners)
// admin_route.get('/current-banner',adminauth.isLogin, adminController.currentBanner)
// admin_route.post('/banners', multer.upload.array('bannerimage',3), adminController.addBanner)

admin_route.post("/",adminController.verifyLogin);
admin_route.post("/addproduct",upload.single('image'),adminController.insertproduct);
admin_route.post("/editproduct",upload.single('image'),adminController.updateProduct);
admin_route.post("/Category",adminController.insertCategory);

module.exports = admin_route;