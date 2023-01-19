const User = require("../models/userModel");
const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const bcrypt = require("bcrypt");
const Coupon = require("../models/couponModel");
const Order = require("../models/orderModel");
const Banner = require("../models/bannerModel");


const adminload = async (req, res) => {
  try {
      console.log("admin loading")
    res.render("login");
    console.log("admin loaded")

  } catch (error) {
    console.log(error.message);
  }
};

const verifyLogin = async (req, res) => {
  try {

      const email = req.body.email;
      const password = req.body.password;

      const userData = await User.findOne({ email: email })
      
      if (userData) {
          const passwordMatch = await bcrypt.compare(password, userData.password)
          

          if (passwordMatch) {

              if (userData.is_admin === 0) {
                  res.render('login', { message: "email and password incorrect" });
              }
              else {
                  req.session.admin_id = userData._id;
                  console.log(req.session.admin_id)
                  res.redirect("/admin/home");
              }

          } else {
              res.render('login', { message: "email and password is incorrect" });
          }

      }
      else {
          res.render('login', { message: "email and password is incorrect" });
      }

  } catch (error) {
      console.log(error.message);
  }
}

const  logout = async (req, res) => {
  try {
      req.session.admin_id = null;
      console.log(req.session.admin_id)
      res.redirect('/admin')
  } catch (error) {
      console.log(error.message);
  }
}



// const verifyLogin = async (req, res) => {
  
//   try {
//     const email = req.body.email;
//     const password = req.body.password;
//     console.log("admin page");
//     console.log(email)
//     console.log(password)
//     const userData = await User.findOne({ email: email });
//     console.log(userData)
   
//     if (userData) {
//       const passwordMatch = await bcrypt.compare(password, userData.password)
//       if (passwordMatch) {
//         if (userData.is_admin === 1) {
//           req.session.admin_id = userData._id;
//           console.log("admin page");
//           res.redirect("/admin/home");
//         }
//        else {
//         console.log("admin wrong id")
//         res.redirect("/admin");
//       } 
//     }
//     else{
//       res.render("login")
//     }

//     else{
//       res.render("login",{message:"wrong admin"})
//     }
   
    
//   } catch (error) {
//     console.log(error.message);
//   }
// };


  const adminhome  = async (req,res)=>{
   try {
    const usersData = await User.find({is_admin:0})
    res.render("home",{users:usersData});
   } catch (error) {
    console.log(error.message);
   }
  }

  const  adminDashboard  = async (req,res)=>{
    try {
      const usersData = await User.find({is_admin:0})
      console.log(usersData)
     res.render("dashboard",{users:usersData});
    } 
    catch (error) {
     console.log(error.message);
    }
   }

  
  const  block_user = async(req,res)=>{
    console.log("block started")
    console.log(req.query.id)
    try {
      // const block_id = req.query._id;
      // console.log(block_id)
      const userData = await User.findByIdAndUpdate({_id:req.query.id},{$set:{is_blocked:1}});
      res.redirect( "/admin/dashboard")

      
    } catch (error) {
      console.log("error while blocking")
    }
  }  
  
  const unblock_user = async(req,res)=>{
    console.log("unblock started")
    console.log(req.query.id)
    try {
      // const block_id = req.query._id;
      // console.log(block_id)
      const userData = await User.findByIdAndUpdate({_id:req.query.id},{$set:{is_blocked:0}});
      res.redirect( "/admin/dashboard")

      
    } catch (error) {
      console.log("error while blocking")
    }
  } 

const productlist = async (req,res)=>{
  try {
    const productData = await Product.find( ) 
    console.log(productData)
    res.render("productlist",{product:productData})
  } catch (error) {
    console.log("product list catch error")
  }
}
const addproduct = async (req,res)=>{
  try {

    const categorydrop = await Category.find()
    console.log(categorydrop);
     res.render("addproduct",{Categorydrop:categorydrop})
  } catch (error) {
    console.log("add product error")
  }
}

const insertproduct = async (req,res)=>{
  try {
    const product = new Product({
     name:req.body.name,
      category:req.body.category,
      rating:req.body.rating,
      price:req.body.price,
      stock:req.body.stock,
      image:req.file.filename,
      description:req.body.description,
     
    })
    console.log(product.name);
    const productData = await product.save();
    // console.log(productData)
    if(productData){
      console.log(productData)
      res.redirect("/admin/productlist")
    }
    else{
      res.render("addproduct")
    }
  } catch (error) {
    console.log("insertproduct error")
  }
}
const   deleteproduct = async (req,res)=>{
      try {
        const id = req.query.id;
        await Product.findByIdAndUpdate({_id:id},{$set:{isavailable:1}});
        res.redirect('/admin/productlist');
        console.log("del")
      } catch (error) {
        console.log("delete product error")
      }

}
const   retrieveproduct = async (req,res)=>{
  try {
    const id = req.query.id;
    await Product.findByIdAndUpdate({_id:id},{$set:{isavailable:0}});
    res.redirect('/admin/productlist');
    console.log("del")
  } catch (error) {
    console.log("delete product error")
  }

}




const editproduct = async (req,res)=>{
  try {
    const id = req.query.id; 
    console.log(id)
    const productdata = await Product.findById({_id:id});
    console.log(productdata)
    if(productdata){
      res.render('editproduct',{product: productdata})
    }
    else{
      res.redirect('/admin/productlist')
    }
    
  } catch (error) {
    console.log(error)
  }
}

const viewOrderProduct =  async(req,res)=>{
  console.log("order history produuct id")
  console.log(req.query.id)
  try {

    const order2 = await Order.findById({_id:req.query.id})
    
    console.log(order2.products.item[0].productId)
      const productdata = await Product.findOne({_id:order2.products.item[0].productId})
      console.log("productdata "+productdata)
      console.log("productdata category  "+productdata.name)
      res.render("viewproductdetails",{product:productdata})      
      // console.log(product)
  } catch (error) {
    console.log(error)
  }
}


const viewProduct =  async(req,res)=>{
  console.log("product list produuct id")
  console.log(req.query.id)
  try {

    const productdetails = await Product.findById({_id:req.query.id})
    
    console.log(productdetails)
      // const productdata = await Product.findOne({_id:order2.products.item[0].productId})
      // console.log("productdata "+productdata)
      // console.log("productdata category  "+productdata.name)
      res.render("viewproductdetails",{product:productdetails})      
      console.log(product)
  } catch (error) {
    console.log(error)
  }
}


const updateProduct = async(req,res)=>{
  try {
    console.log("updation starts")
    console.log(req.query.id)
    const productData = await Product.findByIdAndUpdate({ _id:req.query.id},{$set:{product_name:req.body.name,
      category:req.body.category,
      rating:req.body.rating,
      price:req.body.price,
      stock:req.body.stock,
      isavailable:req.body.isavailable,     
      image:req.file.filename,
      }});
      console.log("productData")
      res.redirect("/admin/productlist");
    
  } catch (error) {
    console.log(error)
  }
}

const user_Profile = async(req,res)=>{
  try {
    console.log("userprofile loading")
    console.log(req.query.id)
  const  userData = await User.findById({_id:req.query.id})
  const adressData = await userData.populate('Address.item')
  const addressdata = adressData.Address.item
  console.log(userData)
  console.log(userData.name)
  
    res.render("user_Profile",{user:userData, addressdata:addressdata})
  } catch (error) {
    console.log(error)
  }
}

const loadCategory = async (req,res)=>{
  try {
    console.log("category loading")
    console.log(Category.length)
    const categoryData = await Category.find()
    console.log(categoryData)
    // console.log(categoryData.categorisedProduct)   

    res.render("Category",{cat:categoryData})
    console.log("category loaded ")
  } catch (error) {
    
  }
}
const insertCategory = async (req,res)=>{
    try {
      const  name = req.body.name.toLowerCase()
    const categoryData = await Category.find()   
      const ca = await Category.findOne({category:name })
      if(ca){
        res.render("Category",{cat:categoryData,message:"Category already used"})
      }
      else{
        const category = new Category({    
          category:req.body.name        
       })       
       const categoryData = await category.save();       
       if(categoryData){
         res.redirect("/admin/Category")         
       }
      }      
      } catch (error) {
      console.log(error)
    }
}
const   deleteCategory = async (req,res)=>{
  try {
    console.log("delete catgry loaded")
    const id = req.query.id;
    await Category.findByIdAndUpdate({_id:id},{$set:{isavailable:1}});
    res.redirect('/admin/Category');    
  } catch (error) {
    console.log("delete product error")
  }
}

const   showCategory = async (req,res)=>{
  try {
    console.log("show catgry loaded")
    const id = req.query.id;
    await Category.findByIdAndUpdate({_id:id},{$set:{isavailable:0}});
    res.redirect('/admin/Category');    
  } catch (error) {
    console.log("show product error")
  }
}


const loadCoupon = async(req,res)=>{

  try {
    const coupondata = await Coupon.find()
    console.log(coupondata)
    console.log(coupondata.length)
    if(coupondata){
      res.render("coupon",{coupondata:coupondata })

    }
    else{
      res.render("coupon",{ message: " No coupon available please add " })
    }   
  } catch (error) {
    console.log(error)
  }

}
const addCoupon = async(req,res)=>{
        console.log(req.session)
        console.log("add coupon starts");
        console.log(req.body.name)
  try {
    const  name = req.body.name.toLowerCase()
    const coupondata = await Coupon.find()   
    const ca = await Coupon.findOne({category:name })
    if(ca){
        res.render("coupon",{coupondata:coupondata, message:"coupon already used"})
    }
    else{
      const coupon =  new Coupon({
        name:req.body.name,
        discount:req.body.discount,
        usedBy:req.session.userid
       })
       const couponData = await coupon.save();
       console.log(couponData)
       res.redirect("/admin/coupon")
    } 
  } catch (error) {
    console.log(error)
  }

}

const deleteCoupon = async (req,res)=>{
    
    console.log(req.query.id)
  try {
      
       await Coupon.findByIdAndUpdate({_id:req.query.id},{$set:{isavailable:1}})
      res.redirect("/admin/coupon")
  } catch (error) {
    console.log(error)
  }


}
const showCoupon = async (req,res)=>{
    
  console.log(req.query.id)
try {
    
     await Coupon.findByIdAndUpdate({_id:req.query.id},{$set:{isavailable:0}})
    res.redirect("/admin/coupon")
} catch (error) {
  console.log(error)
}


}

const orderHistory = async (req,res)=>{

try {   
  id = req.query.id   
  if(req.query.id){
    const orderData = await Order.find() 
    res.render("orderhistory",{order:orderData,id:id})
  } 
  else{
    const orderdata = await Order.find()
    res.render("orderhistory",{order:orderdata,id:false})
  }
  
 

  
} catch (error) {
  console.log(error)
}

}

const confirmOrder = async (req,res)=>{
    try {

      console.log("order confirm")
         const  orderid = req.query.id
          await Order.updateOne({_id:orderid},{$set:{status:"CONFIRM"}})
          res.redirect("/admin/orderhistory")
      
    } catch (error) {
      console.log(error)
    }
}
const deliverOrder = async (req,res)=>{
  try {

    console.log("order confirm")
       const  orderid = req.query.id
        await Order.updateOne({_id:orderid},{$set:{status:"DELIVERED"}})
        res.redirect("/admin/orderhistory")
    
  } catch (error) {
    console.log(error)
  }
}

const cancelOrder = async (req, res) => {
  const orderid = req.query.id;
  await Order.deleteOne({ _id: orderid });
  res.redirect('/admin/orderHistory');
};


// const loadAdminBanners = async (req, res) => {
//   try {
//     console.log("load admin banner")
//     const banner = await Banner.find()
//     console.log(banner);
//     res.render('banner', {
//       banners: banner
//     })
//   } catch (error) {
//     console.log(error.message)
//   }
// }

// const currentBanner = async (req, res) => {
//   try {
//     const id = req.query.id
//     await Banner.findOneAndUpdate({isActive:1},{$set:{isActive:0}})

//     await Banner.findByIdAndUpdate({ _id: id },{$set:{isActive:1}})
//     res.redirect('/admin/banners')
//   } catch (error) {
//     console.log(error.message)
//   }
// }

// const addBanner = async (req, res) => {
//   try {
//     const newBanner = req.body.bannername
//     const a = req.files

//     const banner = new Banner({
//       banner: newBanner,
//       banerimage:a.map((x) => x.filename)
      
//     })

//     const bannerData = await banner.save()

//     if (bannerData) {
//       res.redirect('/admin/banners')
//     }
//   } catch (error) {
//     console.log(error.message)
//   }
// }
// ;

const addBanner = async (req, res) => {
  console.log("banner loading")
  try {

    adminSession = req.session;
    console.log(adminSession)
    if (adminSession.admin_id) {
      const userData = await User.find({ isAdmin: 0 });
      console.log("userData")
      const productData = await Product.find();
      console.log("productData")
      const bannerlist = await Banner.find();
      console.log("bannerlist");
      res.render('addBanner', {
        banner: bannerlist,
        users: userData,
        product: productData,
       
      });
    } else {
      res.redirect('/admin');
    }

  } catch (error) {
    console.log(error);
  }
};
const getBanner = async (req, res) => {
  console.log("banner postng")
  try {
    adminSession = req.session;
    if (adminSession.adminid) {
      const bannerlist = await Banner.find();
      console.log("bannerlist"+  bannerlist)
      if (bannerlist != null) {
       const b= await Banner.updateOne({
          btitle1: req.body.title1,
          btitle2:  req.body.title2,
          bimage1 : req.files[0] && req.files[0].filename ? req.files[0].filename:"",
          bimage2 : req.files[1] && req.files[1].filename ? req.files[1].filename:""
  
        });
        console.log(b);
        res.redirect('/admin/addbanner');
      } else {
        console.log("banner empty")
        const banner = Banner({
          btitle1: req.body.title1,
          btitle2:  req.body.title2,
          bimage1 : req.files[0] && req.files[0].filename ? req.files[0].filename:"",
          bimage2 : req.files[1] && req.files[1].filename ? req.files[1].filename:""
        });
        console.log(banner);
        const bannerData = await banner.save();
        console.log(bannerData);
        res.redirect('/admin/addbanner');

       
        // if (bannerData) {
        //   res.redirect('/admin/addbanner');
        // } else {
        //   res.render('admin/addBanner', {
        //     message: 'Your registration was a failure',
        //     banner: bannerlist,
        //     users: userData,
        //     product: productData,
        //     layout: '../views/layout/adminLayout.ejs',
        //   });
        // }
      }
    } else {
      res.redirect('/admin');
    }
  } catch (error) {
    console.log(error.message);
  }
};


module.exports = {
  adminload,
  verifyLogin,
  adminhome,
  adminDashboard,
  block_user,
  unblock_user,
  user_Profile,
  productlist,
  addproduct,
  insertproduct,
  deleteproduct,
  editproduct,
  viewOrderProduct,
  viewProduct,
  updateProduct,
  logout,
  loadCategory,
  insertCategory,
  deleteCategory,
  loadCoupon,
  addCoupon,
  deleteCoupon,
  showCoupon,
  orderHistory,
  confirmOrder,
  cancelOrder,
  deliverOrder,
  addBanner,
  getBanner,
  showCategory,
  retrieveproduct

  // loadAdminBanners,
  // currentBanner,
  // addBanner
}
