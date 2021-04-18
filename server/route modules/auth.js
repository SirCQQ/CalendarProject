const express = require('express');
let router = express.Router();
const {User} = require("../model/User");
const bcrypt = require("bcryptjs")
const jwt=require("jsonwebtoken")
router.get("/", (req, res) => {
    res.send("This is the route");
    res.end();
})



router.post("/register", async (req, res) => {
    
    //Check for user 
    const emailExists= await User.findOne({username:req.body.username})
    if(emailExists) return res.status(400).json({message:"Username already exists",error:"username"})

    // Hasing the password 
    const salt= await bcrypt.genSalt(10)
    const hashPass= await bcrypt.hash(req.body.password,salt);

    //Create a new user 
    const user=new User({
        username:req.body.username,
        password:hashPass,
    }) 
    //Saving into database
    try {
        const savedUser=await user.save();
        // res.json({user:savedUser._id})
        // if(savedUser){
            const token = jwt.sign({savedUser},process.env.TOKEN_SECRET)
            res.header("auth-token",token).json({message:"success",jwt:token});
        // }
    }
    //Catching any errors
    catch (e) {
        res.status(400).send(e)
    }


})


router.post("/login", async(req,res)=>{
    //Check for user 
    const user= await User.findOne({username:req.body.username})
    if(!user) return res.status(400).json({message:"No account with this username", error:"username"});

    //Password is correct 
    const validPass=await bcrypt.compare(req.body.password,user.password);
    if (!validPass) return res.status(400).json({message:"Wrong password", error:"password"});
    
    //Create and asign a token
    const token = jwt.sign({user},process.env.TOKEN_SECRET)
    res.header("auth-token",token).json({message:"success",jwt:token});
})

module.exports = router;