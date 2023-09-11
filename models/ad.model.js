
const mongoose = require("mongoose")

const AdSchema = mongoose.Schema(
       
      {  
        name : { type: String , required: true},
        category : { type: String, required: true}, 
        price : { type: Number, required: true},
        image : {type:  String, required: true },
        location : {type:  String, required: true },
        postedAt : {type:  String, required: true },
        description : { type : String, required :true },
       
        user_id : {type : String, required : true}

       }
)

   
const  ADModel = mongoose.model("Ad", AdSchema)

module.exports = {
    ADModel
}


