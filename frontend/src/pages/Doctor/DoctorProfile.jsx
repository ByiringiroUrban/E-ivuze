import React, { useContext, useEffect, useState } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'
import DoctorChangePasswordModal from '../../components/DoctorChangePasswordModal'
import LanguageSwitch from '../../components/LanguageSwitch'
import { LoadingComponents } from '../../components/LoadingComponents'
import DoctorSkeletonLoaders from '../../components/DoctorSkeletonLoaders'
import { getDoctorImageSrc } from '../../utils/doctorImage'

const DOCTOR_PROFILE_DRAFT_KEY = 'doctor_profile_draft_v1'

const DoctorProfile = () => {
  const { dToken, profileData, getProfileData, backendUrl } = useContext(DoctorContext)
  const { currency } = useContext(AppContext)
  const { t } = useTranslation()

  const [isEdit, setIsEdit] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    gender: 'male',
    speciality: '',
    degree: '',
    experience: '',
    about: '',
    fees: '',
    available: true,
    address: {
      line1: '',
      line2: '',
      city: '',
      country: ''
    }
  })

  // Initialize form data when profileData loads/changes
  useEffect(() => {
    if (profileData) {
      setFormData({
        name: profileData.name || '',
        gender: profileData.gender || 'male',
        speciality: profileData.speciality || '',
        degree: profileData.degree || '',
        experience: profileData.experience || '',
        about: profileData.about || '',
        fees: profileData.fees !== undefined && profileData.fees !== null ? String(profileData.fees) : '',
        available: profileData.available !== undefined ? profileData.available : true,
        address: profileData.address || {
          line1: '',
          line2: '',
          city: '',
          country: ''
        },
        // National e-Health Fields
        nid: profileData.nid || '',
        department: profileData.department || '',
        subSpeciality: profileData.subSpeciality || '',
        cpdCredits: profileData.cpdCredits || '',
        languages: profileData.languages ? profileData.languages.join(', ') : '',
        employmentType: profileData.employmentType || 'Full-Time'
      })

      // if profile has an image URL, clear any temporary preview
      setImagePreview(null)
      setSelectedImage(null)
    }
  }, [profileData])

  // Restore draft (if any) on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DOCTOR_PROFILE_DRAFT_KEY)
      if (!raw) return
      const draft = JSON.parse(raw)
      if (!draft || typeof draft !== 'object') return

      setFormData(prev => ({
        ...prev,
        ...(typeof draft.name === 'string' ? { name: draft.name } : {}),
        ...(typeof draft.gender === 'string' ? { gender: draft.gender } : {}),
        ...(typeof draft.speciality === 'string' ? { speciality: draft.speciality } : {}),
        ...(typeof draft.degree === 'string' ? { degree: draft.degree } : {}),
        ...(typeof draft.experience === 'string' ? { experience: draft.experience } : {}),
        ...(typeof draft.about === 'string' ? { about: draft.about } : {}),
        ...(typeof draft.fees === 'string' ? { fees: draft.fees } : {}),
        ...(typeof draft.available === 'boolean' ? { available: draft.available } : {}),
        ...(draft.address && typeof draft.address === 'object' ? { address: draft.address } : {}),
        ...(typeof draft.nid === 'string' ? { nid: draft.nid } : {}),
        ...(typeof draft.department === 'string' ? { department: draft.department } : {}),
        ...(typeof draft.subSpeciality === 'string' ? { subSpeciality: draft.subSpeciality } : {}),
        ...(typeof draft.cpdCredits === 'string' ? { cpdCredits: draft.cpdCredits } : {}),
        ...(typeof draft.languages === 'string' ? { languages: draft.languages } : {}),
        ...(typeof draft.employmentType === 'string' ? { employmentType: draft.employmentType } : {})
      }))

      setIsEdit(true)
    } catch {
      // ignore
    }
  }, [])

  // Persist draft while editing (exclude image)
  useEffect(() => {
    if (!isEdit) return
    try {
      localStorage.setItem(DOCTOR_PROFILE_DRAFT_KEY, JSON.stringify({
        name: formData.name,
        gender: formData.gender,
        speciality: formData.speciality,
        degree: formData.degree,
        experience: formData.experience,
        about: formData.about,
        available: !!formData.available,
        address: formData.address,
        nid: formData.nid || '',
        department: formData.department || '',
        subSpeciality: formData.subSpeciality || '',
        cpdCredits: formData.cpdCredits || '',
        languages: formData.languages || '',
        employmentType: formData.employmentType || 'Full-Time'
      }))
    } catch {
      // ignore
    }
  }, [isEdit, formData])

  // fetch profile when token becomes available
  useEffect(() => {
    if (dToken) {
      getProfileData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dToken])

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB')
      return
    }

    setSelectedImage(file)

    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result)
    reader.readAsDataURL(file)
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target

    if (name.startsWith('address.')) {
      const key = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [key]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }))
    }
  }

  const handleCancel = () => {
    setIsEdit(false)
    setSelectedImage(null)
    setImagePreview(null)
    try { localStorage.removeItem(DOCTOR_PROFILE_DRAFT_KEY) } catch { }
    // reset to profileData values
    if (profileData) {
      setFormData({
        name: profileData.name || '',
        gender: profileData.gender || 'male',
        speciality: profileData.speciality || '',
        degree: profileData.degree || '',
        experience: profileData.experience || '',
        about: profileData.about || '',
        fees: profileData.fees !== undefined && profileData.fees !== null ? String(profileData.fees) : '',
        available: profileData.available !== undefined ? profileData.available : true,
        address: profileData.address || {
          line1: '',
          line2: '',
          city: '',
          country: ''
        },
        nid: profileData.nid || '',
        department: profileData.department || '',
        subSpeciality: profileData.subSpeciality || '',
        cpdCredits: profileData.cpdCredits || '',
        languages: profileData.languages ? profileData.languages.join(', ') : '',
        employmentType: profileData.employmentType || 'Full-Time'
      })
    }
  }

  const updateProfile = async () => {
    // basic validation
    if (!formData.name || formData.name.trim().length < 2) {
      toast.error('Name must be at least 2 characters long')
      return
    }
    if (!formData.speciality || formData.speciality.trim().length < 2) {
      toast.error('Speciality is required')
      return
    }

    setLoading(true)
    try {
      const updateData = {
        name: formData.name.trim(),
        gender: formData.gender,
        speciality: formData.speciality.trim(),
        degree: formData.degree.trim(),
        experience: formData.experience.trim(),
        about: formData.about.trim(),
        available: !!formData.available,
        address: formData.address || {},

        // National e-Health Fields
        nid: formData.nid,
        department: formData.department,
        subSpeciality: formData.subSpeciality,
        cpdCredits: formData.cpdCredits,
        languages: formData.languages ? formData.languages.split(',').map(l => l.trim()) : [],
        employmentType: formData.employmentType
      }

      const payload = new FormData()
      payload.append('name', updateData.name)
      payload.append('gender', updateData.gender)
      payload.append('speciality', updateData.speciality)
      payload.append('degree', updateData.degree)
      payload.append('experience', updateData.experience)
      payload.append('about', updateData.about)
      payload.append('available', String(updateData.available))
      payload.append('address', JSON.stringify(updateData.address))

      // Append National e-Health Fields
      payload.append('nid', updateData.nid);
      payload.append('department', updateData.department);
      payload.append('subSpeciality', updateData.subSpeciality);
      payload.append('cpdCredits', updateData.cpdCredits);
      payload.append('employmentType', updateData.employmentType);
      payload.append('languages', JSON.stringify(updateData.languages));

      if (selectedImage) {
        payload.append('image', selectedImage)
      }

      const { data } = await axios.post(`${backendUrl}/api/doctor/update-profile`, payload, {
        headers: {
          dToken,
          'Content-Type': 'multipart/form-data'
        }
      })

      if (data?.success) {
        toast.success(data.message || 'Profile updated successfully')
        setIsEdit(false)
        setSelectedImage(null)
        setImagePreview(null)
        try { localStorage.removeItem(DOCTOR_PROFILE_DRAFT_KEY) } catch { }
        // refresh profile
        getProfileData()
      } else {
        toast.error(data?.message || 'Failed to update profile')
      }
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || 'Failed to update profile'
      toast.error(msg)
      // optional: console.log(error)
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (!profileData) {
    return <DoctorSkeletonLoaders.ProfileSkeleton />;
  }

  const displayFees = formData.fees !== '' && formData.fees !== null
    ? `${currency} ${Number(formData.fees).toLocaleString()} `
    : `${currency} 0`

  return (
    <div className="flex-1 bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#064e3b]">
            {t('doctor.profilePage.title') || 'My Profile'}
          </h1>
          <p className="text-gray-600 mt-1">
            {t('doctor.profilePage.subtitle') || 'Manage your profile information and settings'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
              {/* Profile Image */}
              <div className="relative mb-6">
                <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                  <img
                    className="w-full h-full object-cover"
                    src={imagePreview || getDoctorImageSrc(profileData)}
                    alt="Doctor Profile"
                  />
                </div>

                {isEdit && (
                  <label
                    className="absolute bottom-3 right-3 bg-[#006838] text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-[#004d2a] transition-all text-sm font-medium shadow-lg flex items-center gap-2"
                    aria-label="Change profile photo"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {t('doctor.profilePage.changeImage') || 'Change Photo'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Quick Info */}
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    {t('doctor.profilePage.status') || 'Status'}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className={`w - 3 h - 3 rounded - full ${formData.available ? 'bg-green-500' : 'bg-gray-400'} `} />
                    <span className={`text - sm font - medium ${formData.available ? 'text-green-600' : 'text-gray-600'} `}>
                      {formData.available ? (t('ui.available') || 'Available') : (t('ui.notAvailable') || 'Not Available')}
                    </span>
                  </div>
                </div>

                {profileData.licenseNumber && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      {t('doctor.profilePage.medicalLicenseNumber') || 'License Number'}
                    </p>
                    <p className="text-sm font-medium text-gray-800">{profileData.licenseNumber}</p>
                  </div>
                )}

                {profileData.email && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      {t('doctor.profilePage.email') || 'Email'}
                    </p>
                    <p className="text-sm font-medium text-gray-800 break-all">{profileData.email}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-[#064e3b]">
                  {isEdit ? (t('doctor.profilePage.editProfile') || 'Edit Profile') : (t('doctor.profilePage.profileInformation') || 'Profile Information')}
                </h2>

                <div className="flex gap-3">
                  {isEdit ? (
                    <>
                      <button
                        onClick={handleCancel}
                        disabled={loading}
                        className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all text-sm font-medium disabled:opacity-50"
                      >
                        {t('ui.cancel') || 'Cancel'}
                      </button>

                      <button
                        onClick={updateProfile}
                        disabled={loading}
                        className="px-6 py-2 bg-[#006838] text-white rounded-lg hover:bg-[#004d2a] transition-all text-sm font-medium disabled:opacity-50 flex items-center gap-2"
                      >
                        {loading ? (
                          <LoadingComponents.ButtonLoader text={t('ui.saving') || 'Saving...'} />
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {t('doctor.profilePage.save') || 'Save Changes'}
                          </>
                        )}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEdit(true)}
                      className="px-6 py-2 bg-[#006838] text-white rounded-lg hover:bg-[#004d2a] transition-all text-sm font-medium flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      {t('doctor.profilePage.edit') || 'Edit Profile'}
                    </button>
                  )}
                </div>
              </div>

              {/* Form */}
              <div className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('doctor.profilePage.fullName') || 'Full Name'} <span className="text-red-500">*</span>
                  </label>
                  {isEdit ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#205c90] focus:border-transparent"
                      placeholder={t('doctor.profilePage.enterFullName') || 'Enter your full name'}
                    />
                  ) : (
                    <p className="text-gray-800 font-medium">{formData.name}</p>
                  )}
                </div>

                {/* Gender, Speciality & Degree */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('pages.login.gender') || 'Gender'} <span className="text-red-500">*</span>
                    </label>
                    {isEdit ? (
                      <select
                        name="gender"
                        value={formData.gender || 'male'}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006838] focus:border-transparent"
                      >
                        <option value="male">{t('pages.login.male') || 'Male'}</option>
                        <option value="female">{t('pages.login.female') || 'Female'}</option>
                      </select>
                    ) : (
                      <p className="text-gray-800">{(formData.gender || '').toLowerCase() === 'female' ? (t('pages.login.female') || 'Female') : (t('pages.login.male') || 'Male')}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('doctor.profilePage.speciality') || 'Speciality'} <span className="text-red-500">*</span>
                    </label>
                    {isEdit ? (
                      <input
                        type="text"
                        name="speciality"
                        value={formData.speciality}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006838] focus:border-transparent"
                        placeholder={t('doctor.profilePage.enterSpeciality') || 'e.g., Cardiologist'}
                      />
                    ) : (
                      <p className="text-gray-800">{formData.speciality}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('doctor.profilePage.degree') || 'Degree'} <span className="text-red-500">*</span>
                    </label>
                    {isEdit ? (
                      <input
                        type="text"
                        name="degree"
                        value={formData.degree}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006838] focus:border-transparent"
                        placeholder={t('doctor.profilePage.enterDegree') || 'e.g., MD, MBBS'}
                      />
                    ) : (
                      <p className="text-gray-800">{formData.degree}</p>
                    )}
                  </div>
                </div>

                {/* Experience & Fees */}
                {/* Experience, Fees & Employment */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('doctor.profilePage.experience') || 'Experience'} <span className="text-red-500">*</span>
                    </label>
                    {isEdit ? (
                      <input
                        type="text"
                        name="experience"
                        value={formData.experience}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006838] focus:border-transparent"
                        placeholder="e.g., 10 years"
                      />
                    ) : (
                      <p className="text-gray-800">{formData.experience}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('doctor.profilePage.appointmentFee') || 'Consultation Fee'} ({currency})
                    </label>
                    <p className="text-gray-800 font-medium">{displayFees}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Employment Type
                    </label>
                    {isEdit ? (
                      <select
                        name="employmentType"
                        value={formData.employmentType || "Full-Time"}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006838] focus:border-transparent"
                      >
                        <option value="Full-Time">Full-Time</option>
                        <option value="Part-Time">Part-Time</option>
                        <option value="Visiting">Visiting</option>
                        <option value="Volunteer">Volunteer</option>
                      </select>
                    ) : (
                      <p className="text-gray-800 font-medium">{formData.employmentType || "Full-Time"}</p>
                    )}
                  </div>
                </div>

                {/* Additional Professional Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">National ID (NID)</label>
                    {isEdit ? (
                      <input
                        type="text"
                        name="nid"
                        value={formData.nid || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="National ID"
                      />
                    ) : (
                      <p className="text-gray-800">{formData.nid || '--'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sub-Speciality</label>
                    {isEdit ? (
                      <input
                        type="text"
                        name="subSpeciality"
                        value={formData.subSpeciality || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="e.g. Pediatric Cardiology"
                      />
                    ) : (
                      <p className="text-gray-800">{formData.subSpeciality || '--'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                    {isEdit ? (
                      <input
                        type="text"
                        name="department"
                        value={formData.department || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="e.g. Surgery"
                      />
                    ) : (
                      <p className="text-gray-800">{formData.department || '--'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">CPD Credits</label>
                    {isEdit ? (
                      <input
                        type="number"
                        name="cpdCredits"
                        value={formData.cpdCredits || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="0"
                      />
                    ) : (
                      <p className="text-gray-800">{formData.cpdCredits || '0'}</p>
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Languages (comma separated)</label>
                    {isEdit ? (
                      <input
                        type="text"
                        name="languages"
                        value={formData.languages || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="English, French, Kinyarwanda"
                      />
                    ) : (
                      <p className="text-gray-800">{formData.languages || '--'}</p>
                    )}
                  </div>
                </div>

                {/* About */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('doctor.profilePage.about') || 'About'} <span className="text-red-500">*</span>
                  </label>
                  {isEdit ? (
                    <textarea
                      name="about"
                      value={formData.about}
                      onChange={handleInputChange}
                      rows={5}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#205c90] focus:border-transparent resize-none"
                      placeholder={t('doctor.profilePage.enterAbout') || 'Tell patients about your background, expertise, and approach to care...'}
                    />
                  ) : (
                    <p className="text-gray-800 whitespace-pre-wrap">{formData.about}</p>
                  )}
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('doctor.profilePage.address') || 'Address'}
                  </label>
                  {isEdit ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        name="address.line1"
                        value={formData.address.line1 || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006838] focus:border-transparent"
                        placeholder={t('doctor.profilePage.addressLine1') || 'Street Address'}
                      />
                      <input
                        type="text"
                        name="address.line2"
                        value={formData.address.line2 || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006838] focus:border-transparent"
                        placeholder={t('doctor.profilePage.addressLine2') || 'Apartment, Suite, etc.'}
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          name="address.city"
                          value={formData.address.city || ''}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006838] focus:border-transparent"
                          placeholder={t('doctor.profilePage.city') || 'City'}
                        />
                        <input
                          type="text"
                          name="address.country"
                          value={formData.address.country || ''}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006838] focus:border-transparent"
                          placeholder={t('doctor.profilePage.country') || 'Country'}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-800">
                      {formData.address.line1 && <p>{formData.address.line1}</p>}
                      {formData.address.line2 && <p>{formData.address.line2}</p>}
                      {(formData.address.city || formData.address.country) && (
                        <p>{[formData.address.city, formData.address.country].filter(Boolean).join(', ')}</p>
                      )}
                      {!formData.address.line1 && !formData.address.line2 && !formData.address.city && !formData.address.country && (
                        <p className="text-gray-400 italic">{t('doctor.profilePage.noAddress') || 'No address provided'}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Availability */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                  <input
                    type="checkbox"
                    name="available"
                    checked={!!formData.available}
                    onChange={handleInputChange}
                    disabled={!isEdit}
                    className="w-5 h-5 text-[#205c90] border-gray-300 rounded focus:ring-[#205c90] disabled:opacity-50"
                    aria-label="Available for appointments"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    {t('doctor.profilePage.available') || 'Available for appointments'}
                  </label>
                </div>

                {/* Change Password */}
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="px-6 py-2 bg-transparent border-2 border-[#205c90] text-[#205c90] hover:bg-[#205c90] hover:text-white rounded-lg transition-all text-sm font-medium"
                  >
                    {t('doctor.profilePage.changePassword') || 'Change Password'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DoctorChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSuccess={() => {
          // optionally refresh profile data or show a toast
        }}
      />

      <LanguageSwitch />
    </div>
  )
}

export default DoctorProfile
