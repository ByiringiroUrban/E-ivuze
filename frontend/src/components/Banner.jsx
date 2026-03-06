import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import IconTexture from './IconTexture'

const Banner = () => {

    const navigate = useNavigate()


  return (
    <div className='flex bg-gradient-to-br from-primary via-primary-dark to-primary roun-large px-6 sm:px-10 md:px-14 lg:px-12 my-20 md:mx-10 relative'>
      <IconTexture opacity={0.15} size={24} className="text-white" />
        {/*--------------- Left Side--------------*/}
        <div className='flex-1 py-8 sm:py-10 md:py-16 lg:py-24 lg:pl-5'>
            <div className='text-xl  sm:text-2xl md:text-3xl lg:text-5xl font-semibold text-white'>
                <p>Book Appointment</p>
                <p className='mt-4'>With 100+ Trusted Doctors</p>
            </div>
            <button onClick={()=>{navigate('/login'); scrollTo(0,0)}} className='bg-primary-light text-sm sm:text-base text-primary-dark px-8 py-3 roun-full mt-6 hover:bg-primary hover:text-white hover:scale-105 transition-all '>Create Account</button>
        </div>

        {/*--------------- Right Side--------------*/}
        <div className='hidden md:block md:w-1/2 lg:w-[770px] relative overflow-visible'>
            <img className='w-[200%] absolute bottom-0 right-0' src={assets.appointment_img} alt="" />
        </div>
    </div>
  )
}

export default Banner