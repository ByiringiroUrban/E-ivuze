import React, { useState, useEffect, useRef } from 'react'
import { specialityData } from '../assets/assets'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const SpecialityMenu = () => {
  const { t } = useTranslation()
  const [currentIndex, setCurrentIndex] = useState(0)
  const carouselRef = useRef(null)
  const containerRef = useRef(null)
  const autoSlideInterval = 3000 // 3 seconds
  
  // Calculate items per view based on screen size
  const getItemsPerView = () => {
    if (typeof window === 'undefined') return 5
    const width = window.innerWidth
    if (width < 640) return 3 // sm
    if (width < 1024) return 4 // md
    return 5 // lg and above
  }
  
  const [itemsPerView, setItemsPerView] = useState(getItemsPerView())
  
  const getSpecialityLabel = (speciality) => {
    const labelMap = {
      'General practitioner': t('pages.speciality.options.general'),
      'General physician': t('pages.speciality.options.general'),
      'Gynecologist': t('pages.speciality.options.gynecologist'),
      'Dermatologist': t('pages.speciality.options.dermatologist'),
      'Pediatricians': t('pages.speciality.options.pediatricians'),
      'Neurologist': t('pages.speciality.options.neurologist'),
      'Internist': t('pages.speciality.options.internist'),
      'Dental': t('pages.speciality.options.dentalSurgeons'),
      'Orthopedic surgeons': t('pages.speciality.options.orthopedicSurgeons'),
      'Plastic surgeons': t('pages.speciality.options.plasticSurgeons'),
      'ENT surgeons': t('pages.speciality.options.entSurgeons'),
      'Emergency physicians': t('pages.speciality.options.emergencyPhysicians'),
      'Nephrologists': t('pages.speciality.options.nephrologists'),
      'Endocrinologists': t('pages.speciality.options.endocrinologists'),
      'Cardiologists': t('pages.speciality.options.cardiologists'),
      'Ophthalmologist': t('pages.speciality.options.ophthalmologist'),
      'Urologist': t('pages.speciality.options.urologist'),
      'Sexual Health Physician (GUM)': t('pages.speciality.options.sexualHealthPhysician'),
      'Primary Care Physician': t('pages.speciality.options.primaryCarePhysician'),
    }
    return labelMap[speciality] || speciality
  }

  useEffect(() => {
    const handleResize = () => {
      setItemsPerView(getItemsPerView())
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const maxIndex = Math.max(0, specialityData.length - itemsPerView)
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        if (prevIndex >= maxIndex) {
          return 0 // Reset to start
        }
        return prevIndex + 1
      })
    }, autoSlideInterval)

    return () => clearInterval(interval)
  }, [itemsPerView])

  useEffect(() => {
    if (carouselRef.current && containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth
      const itemWidth = containerWidth / itemsPerView
      const gap = 16 // gap-4 = 1rem = 16px
      const translateX = -(currentIndex * (itemWidth + gap))
      carouselRef.current.style.transform = `translateX(${translateX}px)`
    }
  }, [currentIndex, itemsPerView])

  return (
    <div className='flex flex-col items-center gap-4 py-16 text-gray-800' id='speciality'>
  <h1 className='text-3xl font-medium'>{t('pages.speciality.title')}</h1>
  <p className='sm:w-1/3 text-center text-sm'>{t('pages.speciality.description')}</p>
      <div 
        ref={containerRef}
        className='relative w-full max-w-7xl mx-auto px-4 overflow-hidden'
      >
        <div 
          ref={carouselRef}
          className='flex gap-4 pt-5 transition-transform duration-500 ease-in-out'
        >
          {specialityData.map((item, index) => (
            <Link 
              onClick={() => scrollTo(0, 0)} 
              className='flex flex-col items-center text-xs cursor-pointer flex-shrink-0 hover:translate-y-[-10px] transition-all duration-500' 
              style={{ 
                minWidth: `calc((100% - ${(itemsPerView - 1) * 16}px) / ${itemsPerView})`,
                maxWidth: `calc((100% - ${(itemsPerView - 1) * 16}px) / ${itemsPerView})`
              }}
              key={index} 
              to={`/doctors/${item.speciality}`}
            >
              <img className='w-16 sm:w-24 mb-2' src={item.image} alt={getSpecialityLabel(item.speciality)} />
              <p className='text-center px-2'>{getSpecialityLabel(item.speciality)}</p>
                </Link>
            ))}
        </div>
        </div>
    </div>
  )
}

export default SpecialityMenu