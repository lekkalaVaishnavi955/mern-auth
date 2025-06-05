import React from 'react'
import { Route, Routes } from 'react-router'
import Home from './pages/Home'
import Login from './pages/Login'
import EmailVerify from './pages/EmailVerify'
import ResetPassowrd from './pages/ResetPassowrd'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
function App() {
  return (
    <div>
      <ToastContainer/>
      <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/login' element={<Login />} />
          <Route path='/email-verify' element={<EmailVerify />} />
          <Route path='/reset-password' element={<ResetPassowrd />}/>
      </Routes>
    </div>
  )
}

export default App