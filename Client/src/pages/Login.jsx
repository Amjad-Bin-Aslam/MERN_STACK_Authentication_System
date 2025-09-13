import React, { useContext, useState } from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/appContext'
import axios from 'axios'
import { toast } from 'react-toastify'


function Login() {

  const navigate = useNavigate()   

  const {backendUrl , setIsLoggedIn} = useContext(AppContext)

  const [state, setState] = useState('Sign Up')
  const [name , setName] = useState('')
  const [email , setEmail] = useState('')
  const [password , setPassword] = useState('')

  const onSubmitHandler = async (e) => {
    try {

      e.preventDefault();

      axios.defaults.withCredentials = true;

      if(state === 'Sign Up'){
        const {data} = await axios.post(backendUrl + '/api/auth/register' , {name , email , password})

        if(data.success){
          setIsLoggedIn(true)
          navigate("/")
        }else{
          toast.error(data.message)
        }

      }else {
        
        const {data} = await axios.post(backendUrl + '/api/auth/login' , {email , password});

        if(data.success){
          setIsLoggedIn(true)
          navigate("/")
        }else{
          toast.error(data.message)
        }
      }

    } catch (error) {
  if (error.response && error.response.data) {
    toast.error(error.response.data.message);
  } else {
    toast.error(error.message);
  }
}
  
}

  return (

    <div className='flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400'>

      <img
      onClick={() => navigate('/')}
        src={assets.logo}
        alt=""
        className='absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer'
      />

      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        
        <h2 className="text-3xl font-semibold text-center mb-2">
          {state === 'Sign Up' ? 'Create Account' : 'Login'}
        </h2>
        
        <p className="text-center text-sm mb-6"> 
          {state === 'Sign Up' ? 'Create your account' : 'Login to your account!'}
        </p>

        <form onSubmit={onSubmitHandler} className="space-y-4">

        {state === 'Sign Up' && (
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-gray-50">
            <img src={assets.person_icon} alt="" className="w-5 h-5 mr-2 opacity-70" />
            <input
            onChange={e => setName(e.target.value)}
            value={name}
              type="text"
              placeholder="Full Name"
              required
              className="flex-1 bg-transparent outline-none"
            />
          </div>
        )}

          <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-gray-50">
            <img src={assets.mail_icon} alt="" className="w-5 h-5 mr-2 opacity-70" />
            <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
              type="email"
              placeholder="Email"
              required
              className="flex-1 bg-transparent outline-none"
            />
          </div>

          <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-gray-50">
            <img src={assets.lock_icon} alt="" className="w-5 h-5 mr-2 opacity-70" />
            <input
            onChange={(e) => setPassword(e.target.value)} 
            value={password}
              type="password"
              placeholder="Password"
              required
              className="flex-1 bg-transparent outline-none"
            />
          </div>

          <p 
          onClick={() => navigate('/reset-password')}
          className='mb-4 text-indigo-500 cursor-pointer'>Forgot Password</p>

          <button className='w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium'> {state} </button>

        </form>

        {state === 'Sign Up' ? (
           <p className='text-gray-400 text-center text-xs mt-4'>Already have an account? &nbsp;
          <span onClick={() => setState('Login')} className='text-blue-400 cursor-pointer underline'>Login here</span>
        </p> 
        ) 
        : (
          <p className='text-gray-400 text-center text-xs mt-4'>Don't have an account? &nbsp;
          <span onClick={() => setState('Sign Up')} className='text-blue-400 cursor-pointer underline'>Sign Up</span>
        </p>
        )}


      </div>
    </div>

  )
}


export default Login;
