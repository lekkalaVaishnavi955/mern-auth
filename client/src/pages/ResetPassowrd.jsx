import React, { useContext, useRef, useState } from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router'
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
function ResetPassowrd() {
  const {backendUrl} = useContext(AppContext);
  axios.defaults.withCredentials=true;
  const navigate= useNavigate();
  const [email ,setEmail] = useState("");
   const [newPassword,setNewPassword] = useState("");
    const [isEmailSend,setIsEmailSend] = useState(false);
    const [otp,setOtp] = useState(0);
    const [isOtpSubmitted,setIsOtpSubmitted] = useState(false);
   const inputRefs = useRef([]);
  const handleInput=(e,index)=>{
    if(e.target.value.length>0 && index< inputRefs.current.length-1){
        inputRefs.current[index+1].focus();
    }
  }
  const handleKeyDown=(e , index)=>{
    if(e.key==='Backspace' && e.target.value==='' && index>0){
         inputRefs.current[index-1].focus();
    }
  }
  const handlePaste =(e)=>{
    const paste = e.clipboardData.getData('text');
    const pasteArray = paste.split('');
    pasteArray.forEach((char , index)=>{
      if(inputRefs.current[index]){
          inputRefs.current[index].value=char;
      }
    })
  }
  const onSumbmitEmail=async (e)=>{
    e.preventDefault();
    
    try{
      const {data} = await axios.post(backendUrl+'/api/auth/send-reset-otp' ,{email});
      if(data.success){
        toast.success(data.message);
        setIsEmailSend(true);
        
      }else{
        toast.error(data.message);
      }
    }catch(error){
      toast.error(error.message);
    }
  }
  const onSubmitOtp = async (e)=>{
      e.preventDefault();
      const otpArray = inputRefs.current.map((e)=>e.value);
      setOtp(otpArray.join(""));
      setIsOtpSubmitted(true);

  }
  const onsubmitNewPassword= async (e)=>{
    console.log("inside");
    e.preventDefault();
    try{
      const {data} = await axios.post(backendUrl+"/api/auth/reset-password" , {email , otp ,newPassword});
      if(data.success){
        toast.success(data.message);
        setIsEmailSend(false);
        setIsOtpSubmitted(false);
        navigate("/login");

      }else{
         toast.error(data.message)
      }
    }catch(error){
      toast.error(error.message);
    }
  }
  return (
  
      <div  className='flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400'>
          <img onClick={()=>navigate("/")} src={assets.logo} alt="" className='absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer'/>
   {!isEmailSend &&(
    <form onClick={onSumbmitEmail} className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm'>
                  <h1 className='text-white text-2xl font-semibold text-center mb-4'>Reset Password</h1> 
                  <p className='text-center mb-6 text-indigo-300'>Enter  your registered email id.</p>
                  <div  className = 'mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'> 
                    <img src={assets.mail_icon} alt=""/>
                    <input value={email} onChange={(e)=>setEmail(e.target.value)} 
                    className='bg-transparent outline-none text-white' type="email" placeholder='Email id' required />
                  </div>
                  <button className='w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full mt-3'>Submit</button>
                </form>)}            
                
{/*otp input form*/}
{!isOtpSubmitted && isEmailSend && (
  <form onSubmit={onSubmitOtp} className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm'>
        <h1 className='text-white text-2xl font-semibold text-center mb-4'>Reset password OTP</h1>
        <p className='text-center mb-6 text-indigo-300'>Enter the 6-digit code sent to your email id.</p>
        <div className='flex justify-between mb-8' onPaste={handlePaste}>
          {Array(6).fill(0).map((_,index)=>(
            <input ref={e=>inputRefs.current[index]=e}
            onInput={(e)=>handleInput(e,index)}
            onKeyDown={(e)=>handleKeyDown(e,index)}
            
             type="text" maxLength='1' key={index} required
            className='w-12 h-12 bg-[#333A5C] text-white text-center text-xl
            rounded-md '/>
          ))}
        </div>
        <button  className='w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full'>Reset</button>
</form>
)}

{/* enter the new passowrd*/ }
{isOtpSubmitted && isEmailSend && (
  <form onSubmit={onsubmitNewPassword} className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm'>
                  <h1 className='text-white text-2xl font-semibold text-center mb-4'>New Password</h1> 
                  <p className='text-center mb-6 text-indigo-300'>Enter the new password</p>
                  <div  className = 'mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'> 
                    <img src={assets.lock_icon} alt=""/>
                    <input value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} 
                    className='bg-transparent outline-none text-white' type="password" placeholder='New Password' required />
                  </div>
                  <button className='w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full mt-3'>Submit</button>
</form>

)}
 

      </div>
    
  )
}

export default ResetPassowrd
