import React, { useContext, useState } from "react";
import { assets } from "../../assets/assets";
import { AdminContext } from "../../context/AdminContext";
import { toast } from "react-toastify";
import axios from "axios";
import { useTranslation } from 'react-i18next';
import LanguageSwitch from '../../components/LanguageSwitch';
import { LoadingComponents } from "../../components/LoadingComponents";

const ADMIN_ADD_DOCTOR_DRAFT_KEY = 'admin_add_doctor_draft_v1';

const AddDoctor = () => {
  const [docImg, setDocImg] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [experience, setExperience] = useState("1 Year");
  const [about, setAbout] = useState("");
  const [speciality, setSpeciality] = useState("General practitioner");
  const [gender, setGender] = useState("male");
  const [degree, setDegree] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [loading, setLoading] = useState(false);

  const { backendUrl, aToken } = useContext(AdminContext);
  const { t } = useTranslation();

  // Restore draft on mount
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(ADMIN_ADD_DOCTOR_DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw);
      if (!draft || typeof draft !== 'object') return;

      if (typeof draft.name === 'string') setName(draft.name);
      if (typeof draft.email === 'string') setEmail(draft.email);
      if (typeof draft.experience === 'string') setExperience(draft.experience);
      if (typeof draft.about === 'string') setAbout(draft.about);
      if (typeof draft.speciality === 'string') setSpeciality(draft.speciality);
      if (typeof draft.gender === 'string') setGender(draft.gender);
      if (typeof draft.degree === 'string') setDegree(draft.degree);
      if (typeof draft.licenseNumber === 'string') setLicenseNumber(draft.licenseNumber);
      if (typeof draft.address1 === 'string') setAddress1(draft.address1);
      if (typeof draft.address2 === 'string') setAddress2(draft.address2);
    } catch {
      // ignore
    }
  }, []);

  // Persist draft (do not store password or image)
  React.useEffect(() => {
    try {
      const draft = {
        name,
        email,
        experience,
        about,
        speciality,
        gender,
        degree,
        licenseNumber,
        address1,
        address2
      };
      localStorage.setItem(ADMIN_ADD_DOCTOR_DRAFT_KEY, JSON.stringify(draft));
    } catch {
      // ignore
    }
  }, [name, email, experience, about, speciality, gender, degree, licenseNumber, address1, address2]);

  const resetForm = () => {
    setDocImg(false);
    setName('');
    setPassword('');
    setEmail('');
    setAddress1('');
    setAddress2('');
    setDegree('');
    setLicenseNumber('');
    setAbout('');
    setExperience('1 Year');
    setSpeciality('General practitioner');
    setGender('male');

    try { localStorage.removeItem(ADMIN_ADD_DOCTOR_DRAFT_KEY); } catch {}
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (!docImg || !name || !email || !password || !experience || !about || !speciality || !degree || !licenseNumber || !address1 || !address2) {
      return toast.error(t('admin.addDoctorForm.fillAllFields') || "Please fill in all the required fields.");
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("image", docImg);
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("experience", experience);
      formData.append("about", about);
      formData.append("speciality", speciality);
      formData.append("gender", gender);
      formData.append("degree", degree);
      formData.append("licenseNumber", licenseNumber);
      formData.append("address", JSON.stringify({ line1: address1, line2: address2 }));

      const { data } = await axios.post(
        backendUrl + "/api/admin/add-doctor",
        formData,
        { headers: { aToken } }
      );

      if (data.success) {
        toast.success(data.message || t('admin.addDoctorForm.success'));
        resetForm();
      } else {
        toast.error(data.message || t('admin.addDoctorForm.error'));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t('admin.addDoctorForm.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="bg-[#14324f] text-white px-4 sm:px-8 lg:px-12 py-10 sm:py-14">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-widest text-white/70">{t('admin.addDoctor')}</p>
            <h1 className="text-3xl sm:text-4xl font-semibold">{t('admin.addDoctorTitle')}</h1>
            <p className="text-sm sm:text-base text-white/80 max-w-3xl">{t('admin.addDoctorSubtitle')}</p>
          </div>
          <LanguageSwitch />
        </div>
      </section>

      {/* Content Section */}
      <section className="py-10 sm:py-12">
        <div className="w-full px-4 sm:px-8 lg:px-12 max-w-5xl mx-auto">
          <form onSubmit={onSubmitHandler} className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 sm:p-8">
            {/* Image Upload */}
            <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-200">
              <label htmlFor="doc-img" className="cursor-pointer">
                <img
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                  src={docImg ? URL.createObjectURL(docImg) : assets.upload_area}
                  alt=""
                />
              </label>
              <input
                onChange={(e) => setDocImg(e.target.files[0])}
                type="file"
                id="doc-img"
                accept="image/*"
                hidden
                required
              />
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {t('admin.addDoctorForm.uploadPictureLine1')}
                </p>
                <p className="text-xs text-gray-500">
                  {t('admin.addDoctorForm.uploadPictureLine2')}
                </p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Doctor Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.addDoctorForm.doctorName')} *
                </label>
                <input
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  type="text"
                  placeholder={t('admin.addDoctorForm.doctorNamePlaceholder')}
                  required
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('pages.login.gender') || 'Gender'} *
                </label>
                <select
                  onChange={(e) => setGender(e.target.value)}
                  value={gender}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="male">{t('pages.login.male') || 'Male'}</option>
                  <option value="female">{t('pages.login.female') || 'Female'}</option>
                </select>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.addDoctorForm.doctorEmail')} *
                </label>
                <input
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  type="email"
                  placeholder={t('admin.addDoctorForm.doctorEmailPlaceholder')}
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.addDoctorForm.doctorPassword')} *
                </label>
                <input
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  type="password"
                  placeholder={t('admin.addDoctorForm.doctorPasswordPlaceholder')}
                  required
                />
              </div>

              {/* Experience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.addDoctorForm.experience')} *
                </label>
                <select
                  onChange={(e) => setExperience(e.target.value)}
                  value={experience}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 30].map(year => (
                    <option key={year} value={`${year} Year${year > 1 ? 's' : ''}`}>
                      {year} {year > 1 ? t('admin.addDoctorForm.years') : t('admin.addDoctorForm.year')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Speciality */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.addDoctorForm.speciality')} *
                </label>
                <select
                  onChange={(e) => setSpeciality(e.target.value)}
                  value={speciality}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="General practitioner">{t('pages.doctors.specialityListObj.general') || 'General practitioner'}</option>
                  <option value="Gynecologist">{t('pages.doctors.specialityListObj.gynecologist') || 'Gynecologist'}</option>
                  <option value="Dermatologist">{t('pages.doctors.specialityListObj.dermatologist') || 'Dermatologist'}</option>
                  <option value="Pediatricians">{t('pages.doctors.specialityListObj.pediatricians') || 'Pediatricians'}</option>
                  <option value="Neurologist">{t('pages.doctors.specialityListObj.neurologist') || 'Neurologist'}</option>
                  <option value="Internist">{t('pages.doctors.specialityListObj.internist') || 'Internist'}</option>
                  <option value="Dental">{t('pages.doctors.specialityListObj.dentalSurgeons') || 'Dental'}</option>
                  <option value="Orthopedic surgeons">{t('pages.doctors.specialityListObj.orthopedicSurgeons') || 'Orthopedic surgeons'}</option>
                  <option value="ENT surgeons">{t('pages.doctors.specialityListObj.entSurgeons') || 'ENT surgeons'}</option>
                  <option value="Cardiologists">{t('pages.doctors.specialityListObj.cardiologists') || 'Cardiologists'}</option>
                  <option value="Ophthalmologist">{t('pages.doctors.specialityListObj.ophthalmologist') || 'Ophthalmologist'}</option>
                  <option value="Urologist">{t('pages.doctors.specialityListObj.urologist') || 'Urologist'}</option>
                  <option value="Sexual Health Physician (GUM)">{t('pages.doctors.specialityListObj.sexualHealthPhysician') || 'Sexual Health Physician (GUM)'}</option>
                  <option value="Primary Care Physician">{t('pages.doctors.specialityListObj.primaryCarePhysician') || 'Primary Care Physician'}</option>
                </select>
              </div>

              {/* Education */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.addDoctorForm.education')} *
                </label>
                <input
                  onChange={(e) => setDegree(e.target.value)}
                  value={degree}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  type="text"
                  placeholder={t('admin.addDoctorForm.educationPlaceholder')}
                  required
                />
              </div>

              {/* License Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.addDoctorForm.licenseNumber')} *
                </label>
                <input
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  value={licenseNumber}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  type="text"
                  placeholder={t('admin.addDoctorForm.licenseNumberPlaceholder')}
                  required
                />
              </div>

              {/* Address Line 1 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.addDoctorForm.address')} (Line 1) *
                </label>
                <input
                  onChange={(e) => setAddress1(e.target.value)}
                  value={address1}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  type="text"
                  placeholder={t('admin.addDoctorForm.addressPlaceholder')}
                  required
                />
              </div>

              {/* Address Line 2 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.addDoctorForm.address')} (Line 2) *
                </label>
                <input
                  onChange={(e) => setAddress2(e.target.value)}
                  value={address2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  type="text"
                  placeholder={t('admin.addDoctorForm.address2Placeholder')}
                  required
                />
              </div>
            </div>

            {/* About Doctor */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('admin.addDoctorForm.aboutDoctor')} *
              </label>
              <textarea
                onChange={(e) => setAbout(e.target.value)}
                value={about}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder={t('admin.addDoctorForm.aboutPlaceholder')}
                rows={5}
                required
              />
            </div>

            {/* Submit Button */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? <LoadingComponents.ButtonLoader /> : (t('admin.addDoctorForm.submitButton') || 'Add Doctor')}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

export default AddDoctor;
