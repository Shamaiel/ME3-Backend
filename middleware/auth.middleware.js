const jwt = require("jsonwebtoken")
require("dotenv").config()


/////////******* AUTHENTICATION* //////////
const checkauth = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]
    if(!token){
        return   res.send( { msg:"Login First"})
    }
      
    jwt.verify( token, process.env.KEY, (error, decoded) => {
           
        if(error){
            return res.send( { msg : "Login first"} )
        }
        
        else{
            const {userID} = decoded  
            req.userID = userID;
            
            next()
        }
    })
}

module.exports = { checkauth }
    
   





