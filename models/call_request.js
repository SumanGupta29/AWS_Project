const mongoose = require("mongoose")

CallRequestSchema = new mongoose.Schema({
    name : String,
    email : String,
    phone : String,
    needHelpIn : String,
    role : String
})


module.exports= mongoose.model("CallRequest", CallRequestSchema)