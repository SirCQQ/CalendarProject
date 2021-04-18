const express = require('express');
const {Events}= require('../model/User')
let router = express.Router();
const verify = require("./verify")


router.get("/",verify, async (req,res)=>{
    let userEvents= await Events.find({userId:req.user._id})
    // let userEvents=[] 
    res.json({
        post:{
            title:"My first post ",
            description:"You shall not see this for fuck sake"
        },
        user:req.user,
        events:userEvents
    })
})



router.post("/",verify,async (req,res)=>{

    try{
        let eventNumber= await Events.count({userId:req.user._id})
        if(eventNumber>=10){
            return res.json({error:"To many events"})
        }
        let options = {upsert: true, new: true, setDefaultsOnInsert: true};
        if(req.body._id){
            let update_event= await Events.findOneAndUpdate({'_id':req.body._id,userId:req.user._id},{...req.body,userId:req.user._id},options)
            return  res.json({event:req.body,eventNumber,update_event})
        }
        else{
            let event= new Events({...req.body,userId:req.user._id})

            let newEvent= await event.save()
            return  res.json({event:req.body,eventNumber,newEvent})
        }
    }
    catch(err){
        res.json({error:err})

    }
})


router.delete('/:id',verify,async (req,res)=>{
    try{
        let _id=req.params.id
        Events.findByIdAndDelete(_id,(err)=>{
            if(err)
            {return res.json({error:err})}
            return res.json({success:true})
        })
    }
    catch(e){
        res.json({error:e})
    }
})


module.exports=router;