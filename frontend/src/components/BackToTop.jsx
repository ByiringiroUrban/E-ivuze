import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FaArrowUp } from 'react-icons/fa'

const BackToTop = () => {
  const { t } = useTranslation()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.pageYOffset > 300)
    }

    window.addEventListener('scroll', toggleVisibility)
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (!isVisible) return null

  return (
    <button
      onClick={scrollToTop}
      aria-label={t('backToTop.ariaLabel') || 'Back to top'}
      title={t('backToTop.title') || 'Back to top'}
      className="fixed bottom-[200px] right-6 z-[9999] flex h-14 w-14 items-center justify-center roun-full border border-white/40 bg-white/90 text-primary shadow-lg backdrop-blur transition hover:-translate-y-0.5 hover:bg-primary hover:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
    >
      <FaArrowUp className="text-xl" />
    </button>
  )
}

export default BackToTop
