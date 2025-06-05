import bcrypt from "bcryptjs"
import  jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import transport from "../config/nodeMailer.js";
import { EMAIL_VERIFY_TEMPLATE ,PASSWORD_RESET_TEMPLATE } from "../config/emailTemplate.js";
export const register =async (req , res)=>{
    const {name , email , password} =req.body;
    if(!name || !email || !password){
        return res.json({success:false , message:"missing details"})
    }
    try{
        const existingUser = await userModel.findOne({email});
        if(existingUser){
            return res.json({success:false , message:"user already exists"});
        }
        const hashedPassword = await bcrypt.hash(password , 10);
        const user = new userModel({name , email , password:hashedPassword});
        await user.save();
        const token = jwt.sign({id:user._id},process.env.JWT_SECRET , {expiresIn:'7d'});
        res.cookie('token' , token ,{httpOnly:true,secure:process.env.NODE_ENV === 'production' ,
            sameSite:process.env.NODE_ENV==='production'?'none':'strict',
            maxAge:7*24*60*60*1000
        });
         //sending welcome email
        const mailOptions ={
            from :process.env.SENDER_EMAIL,
            to:email,
            subject:"welcome to my website",
            text:`welcome to myWebsite .your account has been created with email id: ${email}`

        }
         //console.log("email sending");
        await transport.sendMail(mailOptions);
        console.log("email send");
        return res.json({success:true});

    }catch(error){
        res.json({success:false , message:error.message})

    }

}
export const login = async (req , res)=>{
    const {email , password} = req.body;
    if(!email || !password){
        return res.json({success:false , message:"Email and password are required"})
    }
    try{
        const user = await userModel.findOne({email});
        if(!user){
            return res.json({success:false , message:"Invalid email"});
        }
        const isMatch= await bcrypt.compare(password , user.password)
        if(!isMatch){
             return res.json({success:false , message:"Invalid passowrd"});
        }
        const token = jwt.sign({id:user._id},process.env.JWT_SECRET , {expiresIn:'7d'});
        res.cookie('token' , token ,{
            httpOnly:true,secure:process.env.NODE_ENV === 'production' ,
            sameSite:process.env.NODE_ENV==='production'?'none':'strict',
            maxAge:7*24*60*60*1000
        });
        
        return res.json({success:true});
    }catch(error){
        return res.json({success:false , message:error.message});
    }

}
export const logout = async (req , res)=>{
    try{
        res.clearCookie('token' ,{
            httpOnly:true,secure:process.env.NODE_ENV === 'production' ,
            sameSite:process.env.NODE_ENV==='production'?'none':'strict'
        });
         return res.json({success:true , message:'logged out'});
    }catch(error){
        return res.json({success:false , message:error.message});
    }
}
//send verification OTP to the users email
export const sendVerifyOtp = async (req , res)=>{
    try{

        const userId = req.user.id;
        const user = await userModel.findById(userId);
        console.log("sucess");
        console.log(user)
        if(user.isAccountVerified){
              return res.json({success:false , message:"Acoount already verified"});

        }
        console.log("sucess");
  const otp = String(Math.floor(100000+ Math.random()*900000));
  user.verifyOtp=otp;
  user.verifyOtpExpireAt = Date.now()+24*60*60*1000;
  await user.save();
  const mailOption = {
    from:process.env.SENDER_EMAIL,
    to:user.email,
    subject:`Account verification otp`,
    //text:`your OTP is  ${otp}.verify your account using this OTP.`,
    html:EMAIL_VERIFY_TEMPLATE.replace("{{otp}}" , otp).replace("{{email}}" , user.email)
  }
  await transport.sendMail(mailOption);
  return res.json({success:true , message:`verification otp send on email`})
    }catch(error){
         return res.json({success:false , message:error.message});
    }
}
//verify the email with otp
export const verifyEmail=async (req , res)=>{
    const userId = req.user.id;
    const {otp} =req.body;
    console.log(userId);
    if(!userId || !otp){
         return res.json({success:false , message:"missing details"});
    }
    try{
        const user = await userModel.findById(userId);
        if(!user){
           
            return res.json({success:false , message:"User not found"});
        }
        console.log(user);
        if(user.verifyOtp ==='' || user.verifyOtp !== otp){
             
             return res.json({success:false , message:"Invalid OTP"});
        }
        if(user.verifyOtpExpireAt < Date.now()){
             return res.json({success:false , message:"Otp expired"});
        }
        user.isAccountVerified = true;
        user.verifyOtp='';
        user.verifyOtpExpireAt =0;
        await user.save();
        return res.json({success:true , message:'email verified successfully'});

    }catch(error){
         return res.json({success:false , message:error.message});
    }
}
//checl if use is uthenticated
export const isAuthenticated=async (req , res)=>{
    try{
        return res.json({success:true});
    }catch(error){
        return res.json({success:false , message:error.message})
    }
}
//send password reset otp
export const sendResetOtp = async (req , res)=>{
    const {email} = req.body;
    if(!email){

        return res.json({success:false , message:"email is required"});
    }
    try{
        const user = await userModel.findOne({email});
        if(!user){
                 return res.json({success:false , message:"user not found"});
        }
        const otp = String(Math.floor(100000+ Math.random()*900000));
        user.resetOtp=otp;
        user.resetOtpExpireAt = Date.now()+15*60*1000;
        await user.save();
        const mailOption = {
            from:process.env.SENDER_EMAIL,
            to:user.email,
            subject:`password reset otp`,
           // text:`your OTP for resetting your password is  ${otp}.Use this OTp to proceed with resetting your password.`
           html:PASSWORD_RESET_TEMPLATE.replace("{{otp}}" , otp).replace("{{email}}" , email)
        }
        await transport.sendMail(mailOption);
        return res.json({success:true , message:"OTP sned to your email"})
    }catch(error){
        return res.json({success:false , message:error.message})
    }
}
//reset user passowrd
export const resetPassowrd=async (req , res)=>{
    const {email , otp , newPassword}=req.body;
    if(!email || !otp || !newPassword){
        return res.json({success:false , message:"email , otp , newPassword required"})
    }try {
        const user = await userModel.findOne({email});
        if(!user){
            return res.json({success:false , message:"user not found"});
        }
        if(user.resetOtp=== "" || user.resetOtp !==otp){
            return res.json({success:false , message:"Invalid otp"});
        }
        if(user.resetOtpExpireAt < Date.now()){
             return res.json({success:false , message:"OTP expired"});
        }
        const hashedpassword = await bcrypt.hash(newPassword , 10);
        user.password=hashedpassword;
        user.resetOtp="";
        user.resetOtpExpireAt =0;
        await user.save();
         return res.json({success:true , message:"password has been reset sucessfully"});
        
    } catch (error) {
        return rmSync.json({success:false , message:error.message})
    }
}