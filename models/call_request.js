const mongoose = require("mongoose")

CallRequestSchema = new mongoose.Schema({
    name : String,
    email : String,
    phone : String,
    needHelpIn : String,
    role : String,
    status : {
        type : String,
        default : "Pending"
    }
})


module.exports= mongoose.model("CallRequest", CallRequestSchema)