const express = require("express")
const PORT = 3001;
const router=require("./route modules/auth")
const events=require("./route modules/events")
let app = express()
var cors = require('cors')
const mogoose = require("mongoose");
const dotenv=require("dotenv");

dotenv.config();
//Connect to db 
app.use(cors())
mogoose.connect(process.env.DB_URL,
{ useUnifiedTopology: true , useNewUrlParser: true },
()=>{
    console.log("Connected to database");
})
app.use(express.json())

app.use('/api/user',router)
app.use('/api/events',events)


app.listen(PORT, ()=>{
    console.log(`Server starts at http://localhost:${PORT}`)
})