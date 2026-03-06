import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { specialityData } from '../assets/assets';
import AISuggestionButton from '../components/AISuggestionButton';
import { toast } from 'react-toastify';

const GOOGLE_DOCTOR_DRAFT_KEY = 'google_doctor_register_draft_v1';

const GoogleDoctorForm = ({ googleUserData, onSubmit, onCancel, submitting, backendUrl }) => {
  const { t } = useTranslation();
  const [speciality, setSpeciality] = useState('');
  const [degree, setDegree] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [experience, setExperience] = useState('');
  const [about, setAbout] = useState('');
  const [gender, setGender] = useState('male');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(googleUserData?.picture || null);
  const [step, setStep] = useState(1); // 1: Professional, 2: Profile

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(GOOGLE_DOCTOR_DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw);
      if (!draft || typeof draft !== 'object') return;

      if (typeof draft.speciality === 'string') setSpeciality(draft.speciality);
      if (typeof draft.gender === 'string') setGender(draft.gender);
      if (typeof draft.degree === 'string') setDegree(draft.degree);
      if (typeof draft.licenseNumber === 'string') setLicenseNumber(draft.licenseNumber);
      if (typeof draft.experience === 'string') setExperience(draft.experience);
      if (typeof draft.about === 'string') setAbout(draft.about);
      if (typeof draft.addressLine1 === 'string') setAddressLine1(draft.addressLine1);
      if (typeof draft.addressLine2 === 'string') setAddressLine2(draft.addressLine2);
    } catch {
      // ignore
    }
  }, []);

  React.useEffect(() => {
    try {
      const draft = {
        speciality,
        gender,
        degree,
        licenseNumber,
        experience,
        about,
        addressLine1,
        addressLine2
      };
      localStorage.setItem(GOOGLE_DOCTOR_DRAFT_KEY, JSON.stringify(draft));
    } catch {
      // ignore
    }
  }, [speciality, gender, degree, licenseNumber, experience, about, addressLine1, addressLine2]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!speciality || !degree || !licenseNumber || !experience || !about || !addressLine1) {
      toast.error(t('modals.addPatientTitle') || 'Please fill all required fields');
      return;
    }

    if (licenseNumber.trim().length < 5) {
      toast.error(t('pages.login.licensePlaceholder') || 'License number must be at least 5 characters');
      return;
    }

    const formData = {
      googleId: googleUserData.sub,
      email: googleUserData.email,
      name: googleUserData.name,
      image: googleUserData.picture,
      gender,
      speciality,
      degree,
      licenseNumber: licenseNumber.trim(),
      experience,
      about,
      address: JSON.stringify({ line1: addressLine1, line2: addressLine2 }),
      imageFile: image
    };

    try { localStorage.removeItem(GOOGLE_DOCTOR_DRAFT_KEY); } catch { }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl border border-border bg-white/95 shadow-2xl p-6 sm:p-8 space-y-5 text-sm text-zinc-700 rounded-lg">
      <div className="space-y-2">
        <p className="text-xs   tracking-[0.4em] text-primary-dark">
          {t('pages.login.completeDoctorRegistration') || 'Complete Doctor Registration'}
        </p>
        <h2 className="text-2xl font-semibold text-accent">
          {t('pages.login.doctorDetails') || 'Doctor Details'}
        </h2>

        <div className="flex gap-4 mt-6 mb-2">
          <div className="flex-1 space-y-2">
            <div className={`h-1.5 w-full rounded-full transition-colors duration-500 ${step >= 1 ? 'bg-primary' : 'bg-gray-200'}`} />
            <p className={`text-[10px]   tracking-widest text-center ${step === 1 ? 'text-primary font-bold' : 'text-gray-400'}`}>
              {t('pages.login.professional') || 'Professional'}
            </p>
          </div>
          <div className="flex-1 space-y-2">
            <div className={`h-1.5 w-full rounded-full transition-colors duration-500 ${step >= 2 ? 'bg-primary' : 'bg-gray-200'}`} />
            <p className={`text-[10px]   tracking-widest text-center ${step === 2 ? 'text-primary font-bold' : 'text-gray-400'}`}>
              {t('pages.login.profile') || 'Profile'}
            </p>
          </div>
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
          <div>
            <label className="  text-[11px] tracking-[0.3em] text-muted-foreground">
              {t('pages.login.speciality')} *
            </label>
            <select
              className="w-full border border-border px-4 py-3 mt-2"
              onChange={(e) => setSpeciality(e.target.value)}
              value={speciality}
              required
            >
              <option value="">{t('pages.doctors.allDoctors')}</option>
              {specialityData.map((item, index) => (
                <option key={index} value={item.speciality}>
                  {item.speciality}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="  text-[11px] tracking-[0.3em] text-muted-foreground">
              {t('pages.login.gender') || 'Gender'} *
            </label>
            <select
              className="w-full border border-border px-4 py-3 mt-2"
              onChange={(e) => setGender(e.target.value)}
              value={gender}
              required
            >
              <option value="male">{t('pages.login.male') || 'Male'}</option>
              <option value="female">{t('pages.login.female') || 'Female'}</option>
            </select>
          </div>

          <div>
            <label className="  text-[11px] tracking-[0.3em] text-muted-foreground">
              {t('pages.login.degree')} *
            </label>
            <input
              className="w-full border border-border px-4 py-3 mt-2"
              type="text"
              placeholder={t('pages.login.degreePlaceholder')}
              onChange={(e) => setDegree(e.target.value)}
              value={degree}
              required
            />
          </div>

          <div>
            <label className="  text-[11px] tracking-[0.3em] text-muted-foreground">
              {t('pages.login.medicalLicense')} *
            </label>
            <input
              className="w-full border border-border px-4 py-3 mt-2"
              type="text"
              placeholder={t('pages.login.licensePlaceholder')}
              onChange={(e) => setLicenseNumber(e.target.value)}
              value={licenseNumber}
              required
              minLength={5}
            />
          </div>

          <div>
            <label className="  text-[11px] tracking-[0.3em] text-muted-foreground">
              {t('pages.login.experience')} *
            </label>
            <input
              className="w-full border border-border px-4 py-3 mt-2"
              type="text"
              placeholder={t('pages.login.experiencePlaceholder')}
              onChange={(e) => setExperience(e.target.value)}
              value={experience}
              required
            />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
          <div>
            <label className="  text-[11px] tracking-[0.3em] text-muted-foreground">
              {t('nav.about')} *
            </label>
            <textarea
              className="w-full border border-border px-4 py-3 mt-2 min-h-[120px]"
              placeholder={t('pages.login.aboutPlaceholder')}
              onChange={(e) => setAbout(e.target.value)}
              value={about}
              required
            />
            <AISuggestionButton
              context={`Doctor registration profile\nName: ${googleUserData?.name || ''}\nSpeciality: ${speciality}\nDegree: ${degree}\nExperience: ${experience}\nAddress: ${addressLine1} ${addressLine2}`}
              fieldType="doctor profile summary"
              backendUrl={backendUrl}
              onSuggestion={(s) => setAbout(s)}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="  text-[11px] tracking-[0.3em] text-muted-foreground">
                {t('pages.login.addressLine1')} *
              </label>
              <input
                className="w-full border border-border px-4 py-3 mt-2"
                type="text"
                placeholder={t('pages.login.addressPlaceholder')}
                onChange={(e) => setAddressLine1(e.target.value)}
                value={addressLine1}
                required
              />
            </div>
            <div>
              <label className="  text-[11px] tracking-[0.3em] text-muted-foreground">
                {t('pages.login.addressLine2')}
              </label>
              <input
                className="w-full border border-border px-4 py-3 mt-2"
                type="text"
                placeholder={t('pages.login.address2Placeholder')}
                onChange={(e) => setAddressLine2(e.target.value)}
                value={addressLine2}
              />
            </div>
          </div>

          <div>
            <label className="  text-[11px] tracking-[0.3em] text-muted-foreground">
              {t('pages.login.profileImageOptional')}
            </label>
            {imagePreview && (
              <img src={imagePreview} alt="Preview" className="w-20 h-20 rounded-full object-cover my-3 border border-border" />
            )}
            <input
              className="w-full border border-border px-4 py-3 mt-2"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>
        </div>
      )}

      <div className="flex gap-3">
        {step === 1 ? (
          <button
            type="button"
            onClick={() => {
              try { localStorage.removeItem(GOOGLE_DOCTOR_DRAFT_KEY); } catch { }
              onCancel();
            }}
            disabled={submitting}
            className="flex-1 border border-border text-accent py-3 text-xs   tracking-[0.4em] hover:bg-gray-50 transition rounded disabled:opacity-50"
          >
            {t('buttons.cancel') || 'Cancel'}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setStep(1)}
            disabled={submitting}
            className="flex-1 border border-border text-accent py-3 text-xs   tracking-[0.4em] hover:bg-gray-50 transition rounded disabled:opacity-50"
          >
            {t('buttons.back') || 'Back'}
          </button>
        )}

        {step === 1 ? (
          <button
            type="button"
            onClick={() => {
              if (speciality && degree && licenseNumber && experience && licenseNumber.trim().length >= 5) {
                setStep(2);
              } else {
                toast.error('Please fill all professional details correctly');
              }
            }}
            className="flex-1 bg-primary text-white py-3 text-xs   tracking-[0.4em] hover:bg-primary-dark transition rounded"
          >
            {t('buttons.next') || 'Next'}
          </button>
        ) : (
          <button
            type="submit"
            disabled={submitting}
            className={`flex-1 bg-primary text-white py-3 text-xs   tracking-[0.4em] ${submitting ? 'opacity-60 cursor-not-allowed' : 'hover:bg-primary-dark'
              } transition rounded`}
          >
            {submitting ? t('buttons.processing') : t('buttons.createAccount')}
          </button>
        )}
      </div>
    </form>
  );
};

export default GoogleDoctorForm;
