import React from 'react';
import { useNavigate } from 'react-router-dom';
import { specialityData } from '../assets/assets';
import { useTranslation } from 'react-i18next';

const SpecialitiesModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (!isOpen) return null;

  const handleSpecialityClick = (speciality) => {
    console.log('Speciality clicked:', speciality);
    console.log('Navigating to:', `/doctors?speciality=${encodeURIComponent(speciality)}`);
    navigate(`/doctors?speciality=${encodeURIComponent(speciality)}`);
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-[#3b7ab5] text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">{t('pages.home.medicalSpecialistsSection.title') || 'Medical Specialists'}</h2>
              <p className="text-white/80 mt-1">Choose a speciality to find doctors</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {specialityData.map((item, index) => (
              <div
                key={index}
                onClick={() => handleSpecialityClick(item.speciality)}
                className="bg-gray-50 hover:bg-[#e8f4ff] border border-gray-200 hover:border-[#5faee3] rounded-lg p-4 text-center cursor-pointer transition-all duration-200 hover:shadow-md group"
              >
                <div className="w-16 h-16 mx-auto mb-3 bg-[#e8f4ff] rounded-full flex items-center justify-center group-hover:bg-[#5faee3] transition-colors">
                  <img
                    src={item.image}
                    alt={item.speciality}
                    className="w-10 h-10 object-contain"
                  />
                </div>
                <h3 className="text-sm font-semibold text-gray-800 group-hover:text-[#5faee3] transition-colors leading-tight">
                  {item.speciality}
                </h3>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              {specialityData.length} specialities available
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecialitiesModal;
