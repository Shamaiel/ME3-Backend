const express = require("express")
require("dotenv").config()
const { connection } = require("./config/db");
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken");
const { UserModel } = require("./models/user.model");
const { ADModel } = require("./models/ad.model");
const cors = require("cors");
const { checkauth } = require("./middleware/auth.middleware");




const PORT = process.env.PORT

const app = express()
app.use(express.json())


app.post("/signup", async (req, res) => {
    const { name, email, password } = req.body;
  
    try {
      const existingUser = await UserModel.findOne({ email });
  
      if (existingUser) {
        return res.json({ msg: "Entered Email is already registered, Try with different one" });
      }
  
      const hashedPassword = await bcrypt.hash(password, 5);
  
      await UserModel.create({
            password: hashedPassword,
            email,
            name,
      });
  
      res.json({ msg: "Sign up successful" });
    } 
    catch (error) {

      console.error(error);
      res.send({ msg: "Error creating user" });
    }
  });


//////LOGINING CODE HERE////
  app.post("/login", async (req, res) => {

    const { email, password } = req.body

    const iSexistingUser = await UserModel.findOne( { email } )
    
    if( iSexistingUser ){
        
        const hashedPassword = iSexistingUser.password;

        bcrypt.compare(password, hashedPassword, function(err, result) {
           
            if( result ){

                const token = jwt.sign({userID : iSexistingUser._id},  process.env.KEY)
                res.send({ msg: "Login Successfull", token : token } )
            }
            else{
                res.send("Login Failed")
            }
        })
    }
    else{
        res.send("Sign up first")
    }
})


app.use(checkauth)

//////**** GETTING ALL POSTS  ******////
app.get("/posts", async (req, res) => {
   
    try{
        const Ads = await ADModel.find( {user_id : req.userID } )
        res.send( { Ads } )
    }
    catch(err){

        console.log(err)
        res.send({message : "Something went wronng !Please Try again later"})
    }
})


//////**** ADDING POSTS HERE  ******////
app.post("/posts/add" ,  async (req, res) => {
   
    const {name, description, price, category, image, location,  postedAt   } = req.body

    const userID = req.userID
    
    const new_post = new  ADModel(
        {  
             name,
            description,
            category,
            price,
            image,
            location,
            postedAt,
            user_id : userID

        })

    try{ 
        await new_post.save()

        return res.send( {msg : "Product  added successfully "})
    }

    catch(err){

        console.log(err)

        res.send({msg : "something is wrong"})

    }
})

//////**** DELETE******////
app.delete("/posts/:postID", async (req, res) => {

    const { postID } = req.params

    try{
      
        const prodcts = await ADModel.findOneAndDelete({_id : postID,  user_id : req.userID})

        if(  prodcts ){
            res.send({msg : "Product deleted sucCessfully"})
        }

        else{
            res.send({msg : "Product not found!!! or You are not Authorised"})
        }
    }
    catch(err){
        console.log(err)
        res.send({msg : "something went wrong, please try again later"})
    }
})



// {_id : productID,  user_id : req.userID}
app.put('/posts-update/:id', async (req, res) => {
    try {
        const products = await ADModel.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        })

        if(!products){
            return res.json({error: 'Prodct not found'});
        }
        res.json(products);

    } catch (error) {
        res.status(404).json({error: 'Failed to update prdct'});
    }
})


///Sort, filter, pagination, queryies search
        app.get('/new-posts', async(req,res)=>{
            
            try {  
                const { filter, sort, order, q, page, limit } = req.query    
                const query = { }
                    if (q) {
                        query.name = {            
                            $regex: q, 
                            $options: 'i' 
                        }
                    }
                    if (filter) {
                        query.category = filter
                    }

                   const sortOptions = {  }
                    if (sort) {
                        sortOptions[sort] = order === 'desc' ? -1 : 1
                    }
        
                    const options = {

                        sort: sortOptions,
                        skip: (page-1)*limit,
                        limit:    +limit,
                    }
        
                const products = await ADModel.find(query, null, options);
                 res.json( products)

            } 
            catch(error){

                res.send({ error: "Something went Wrong" })
            }
        })
        

app.listen(PORT, async ()=>{
    
    try {
        await connection
        console.log(`connected to DB successfully at ${PORT} port`)
        
    } 
    catch (error) {
        console.log("error while connecting to DB")
        console.log(err)
        
    }

})



