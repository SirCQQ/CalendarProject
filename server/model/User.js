const mongoose = require("mongoose");
const {Schema }=mongoose 
const eventSchema = new Schema({
    userId:{
        type:mongoose.Types.ObjectId,
        required:true
    },
    startHour:{
        type:String,
    },
    endHour:{
        type:String
    },
    day:{
        type:Date,
    },
    recurrence:{
        type: Boolean
    },
    recurrence_period:{
        type:String
    },
    name:{
        type:String,
        required:true
    }
})
const userSchema=new Schema({
    username:{
        type:String,
        required:[true,"Username is requeired"],
        unique:[true,"Username already exists"]
    },
    password:{
        type:String,
        required:true,
        max:1024,
        min:6
    },
    date:{
        type:Date,
        default:Date.now
    }        
})


module.exports={ User:mongoose.model("User",userSchema),Events: mongoose.model('Events',eventSchema)}