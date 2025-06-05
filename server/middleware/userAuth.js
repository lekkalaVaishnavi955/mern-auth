import  jwt from "jsonwebtoken";

const userAuth = async (req , res ,next)=>{
    console.log("userAuth satrted");
    const {token} = req.cookies;
    console.log(token);
    if(!token){
        return res.json({success : false , message:"not authorized. Login again"})

    }
    try{
       const tokenDecode= jwt.verify(token ,process.env.JWT_SECRET);
       console.log(tokenDecode);
       if(tokenDecode.id){
        req.user = {id :tokenDecode.id};
       }else{
         return res.json({success : false , message:"not authorized. Login again"})

       }
       next();
    }catch(error){
         return res.json({success : false , message:error.message})

    }
}
export default userAuth;