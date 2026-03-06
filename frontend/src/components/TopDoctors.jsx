import React, { useContext } from 'react'

import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { useTranslation } from 'react-i18next'
import { getDoctorImageSrc } from '../utils/doctorImage'

const TopDoctors = () => {
        const { t } = useTranslation()
        const navigate = useNavigate()
        const {doctors, consultationFee, currency} = useContext(AppContext)

  return (
    <div className='flex flex-col items-center gap-4 my-16 text-gray-800 md:mx-10 '>
                <h1 className='text-3xl font-medium'>{t('pages.topDoctors.title')}</h1>
                <p className='sm:w-1/3 text-center text-sm'>{t('pages.topDoctors.subtitle')}</p>
        <div className='w-full grid grid-cols-auto gap-4 pt-5 gap-y-6 px-3 sm:px-0'>
            {doctors.filter(doc => doc.available !== false).slice(0,10).map((item,index)=>(
                <div onClick={() => {navigate(`/appointment/${item._id}`); scrollTo(0,0) }} className='border border-primary/20 roun-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500  ' key={index}>
                    <img className='w-full h-64 bg-gradient-to-br from-primary/10 to-primary-light/10 object-cover' src={getDoctorImageSrc(item)} alt={item?.name || 'Doctor'} />
                    <div className='p-4'>
                        <div className={`flex items-center gap-2 text-sm text-center ${item.available ? 'text-primary-dark' : 'text-gray-500'} `}>
                            <p className={`w-2 h-2 ${item.available ? 'bg-primary' : 'bg-gray-500'}  roun-full`}></p><p>{item.available ? t('ui.available') : t('ui.notAvailable')}</p>
                        </div>
                        <p className='text-gray-900 text-lg font-medium'>{item.name}</p>
                        <p className='text-gray-600 text-sm'>{item.speciality}</p>
                        <div className='flex items-center justify-between pt-2 border-t border-gray-100 mt-2'>
                          <p className='text-primary-600 font-semibold text-base'>
                            {currency} {consultationFee?.toLocaleString() || '3,000'}
                          </p>
                          <span className='text-xs text-gray-500'>{t('pages.doctors.consultationFee') || 'Consultation Fee'}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
                <button onClick={()=>{ navigate('/doctors'); scrollTo(0,0) }} className='bg-primary-light text-primary-dark border border-primary/20 px-12 py-3 roun-full mt-10 hover:bg-primary hover:text-white transition-all duration-300'>{t('buttons.more') || 'more'}</button>
    </div>
  )
}

export default TopDoctors