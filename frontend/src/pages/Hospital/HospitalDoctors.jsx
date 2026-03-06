import React, { useState, useEffect, useContext } from 'react';
import { HospitalContext } from '../../context/HospitalContext';
import { specialityData } from '../../assets/assets';
import { useTranslation } from 'react-i18next';
import { LoadingComponents } from '../../components/LoadingComponents';
import EmptyState from '../../components/EmptyState';
import { downloadExcelXml } from '../../utils/exportUtils';
import { getDoctorImageSrc } from '../../utils/doctorImage';

const HOSPITAL_DOCTOR_DRAFT_KEY = 'hospital_doctor_form_draft_v1';

const HospitalDoctors = () => {
  const { doctors, getHospitalDoctors, createHospitalDoctor, updateHospitalDoctor, deleteHospitalDoctor } = useContext(HospitalContext);
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [loading, setLoading] = useState(false);

  const exportDoctors = () => {
    const rows = (doctors || []).map((d) => ({
      Name: d?.name || '',
      Email: d?.email || '',
      Phone: d?.phone || '',
      Speciality: d?.speciality || '',
      Degree: d?.degree || '',
      Experience: d?.experience || '',
      LicenseNumber: d?.licenseNumber || ''
    }));

    downloadExcelXml({
      fileName: `hospital_doctors_${new Date().toISOString().slice(0, 10)}.xls`,
      sheets: [
        {
          name: 'Doctors',
          columns: ['Name', 'Email', 'Phone', 'Speciality', 'Degree', 'Experience', 'LicenseNumber'],
          rows
        }
      ]
    });
  };

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    gender: 'male',
    speciality: '',
    degree: '',
    licenseNumber: '',
    experience: '',
    about: '',
    address: { line1: '', line2: '' },
    image: null
  });

  useEffect(() => {
    getHospitalDoctors();
  }, []);

  // Restore draft when opening modal for creating a doctor
  useEffect(() => {
    if (!showModal || editingDoctor) return;
    try {
      const raw = localStorage.getItem(HOSPITAL_DOCTOR_DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw);
      if (!draft || typeof draft !== 'object') return;

      setFormData(prev => ({
        ...prev,
        name: typeof draft.name === 'string' ? draft.name : prev.name,
        email: typeof draft.email === 'string' ? draft.email : prev.email,
        gender: typeof draft.gender === 'string' ? draft.gender : prev.gender,
        speciality: typeof draft.speciality === 'string' ? draft.speciality : prev.speciality,
        degree: typeof draft.degree === 'string' ? draft.degree : prev.degree,
        licenseNumber: typeof draft.licenseNumber === 'string' ? draft.licenseNumber : prev.licenseNumber,
        experience: typeof draft.experience === 'string' ? draft.experience : prev.experience,
        about: typeof draft.about === 'string' ? draft.about : prev.about,
        address: draft.address && typeof draft.address === 'object' ? draft.address : prev.address,
        image: null,
        password: ''
      }));
    } catch {
      // ignore
    }
  }, [showModal, editingDoctor]);

  // Persist draft while creating a doctor (do not store password or image)
  useEffect(() => {
    if (!showModal || editingDoctor) return;
    try {
      const draft = {
        name: formData.name,
        email: formData.email,
        gender: formData.gender,
        speciality: formData.speciality,
        degree: formData.degree,
        licenseNumber: formData.licenseNumber,
        experience: formData.experience,
        about: formData.about,
        address: formData.address
      };
      localStorage.setItem(HOSPITAL_DOCTOR_DRAFT_KEY, JSON.stringify(draft));
    } catch {
      // ignore
    }
  }, [showModal, editingDoctor, formData.name, formData.email, formData.gender, formData.speciality, formData.degree, formData.licenseNumber, formData.experience, formData.about, formData.address]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (editingDoctor) {
      await updateHospitalDoctor(editingDoctor._id, formData);
    } else {
      await createHospitalDoctor(formData);
    }

    setLoading(false);
    setShowModal(false);
    if (!editingDoctor) {
      try { localStorage.removeItem(HOSPITAL_DOCTOR_DRAFT_KEY); } catch { }
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      gender: 'male',
      speciality: '',
      degree: '',
      licenseNumber: '',
      experience: '',
      about: '',
      address: { line1: '', line2: '' },
      image: null
    });
    setEditingDoctor(null);
  };

  const handleEdit = (doctor) => {
    setEditingDoctor(doctor);
    setFormData({
      name: doctor.name,
      email: doctor.email,
      password: '',
      gender: doctor.gender || 'male',
      speciality: doctor.speciality,
      degree: doctor.degree,
      licenseNumber: doctor.licenseNumber,
      experience: doctor.experience,
      about: doctor.about,
      address: doctor.address || { line1: '', line2: '' },
      image: null
    });
    setShowModal(true);
  };

  const handleDelete = async (doctorId) => {
    if (window.confirm(t('hospital.doctors.confirmDelete'))) {
      await deleteHospitalDoctor(doctorId);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{t('hospital.doctors.title')}</h2>
        <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={exportDoctors}
            className="w-full sm:w-auto px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {t('hospital.reports.exportExcel') || 'Export Excel'}
          </button>
          <button
            type="button"
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="w-full sm:w-auto px-4 py-2 bg-[#006838] text-white rounded-lg hover:bg-[#004d2a] transition-colors"
          >
            {t('hospital.doctors.addDoctor')}
          </button>
        </div>
      </div>

      {/* Doctors List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading && doctors.length === 0 ? (
          <div className="col-span-full py-12">
            <LoadingComponents.DataLoader />
          </div>
        ) : doctors.length === 0 ? (
          <div className="col-span-full py-12">
            <EmptyState variant="data" title={t('hospital.doctors.noDoctors')} />
          </div>
        ) : (
          doctors.map(doctor => (
            <div key={doctor._id} className="bg-white rounded-lg shadow p-4">
              <img src={getDoctorImageSrc(doctor)} alt={doctor.name} className="w-full h-48 object-cover rounded-lg mb-4" />
              <h3 className="font-semibold text-base sm:text-lg mb-1">{doctor.name}</h3>
              <p className="text-sm text-gray-600 mb-1">{doctor.speciality}</p>
              <p className="text-sm text-gray-600 mb-4">{doctor.degree}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(doctor)}
                  className="flex-1 px-3 py-2 bg-emerald-50 text-[#006838] rounded hover:bg-emerald-100 text-sm"
                >
                  {t('buttons.edit')}
                </button>
                <button
                  onClick={() => handleDelete(doctor._id)}
                  className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 text-sm"
                >
                  {t('buttons.delete')}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg sm:text-xl font-bold mb-4">{editingDoctor ? t('hospital.doctors.editDoctor') : t('hospital.doctors.addDoctor')}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder={t('hospital.doctors.name')}
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="px-4 py-2 border rounded-lg"
                />
                <input
                  type="email"
                  placeholder={t('hospital.doctors.email')}
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="px-4 py-2 border rounded-lg"
                />
                {!editingDoctor && (
                  <input
                    type="password"
                    placeholder={t('hospital.doctors.password')}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="px-4 py-2 border rounded-lg"
                  />
                )}
                <select
                  required
                  value={formData.speciality}
                  onChange={(e) => setFormData({ ...formData, speciality: e.target.value })}
                  className="px-4 py-2 border rounded-lg"
                >
                  <option value="">{t('hospital.doctors.selectSpeciality')}</option>
                  {specialityData.map(spec => (
                    <option key={spec.speciality} value={spec.speciality}>{spec.speciality}</option>
                  ))}
                </select>
                <select
                  required
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="px-4 py-2 border rounded-lg"
                >
                  <option value="male">{t('pages.login.male') || 'Male'}</option>
                  <option value="female">{t('pages.login.female') || 'Female'}</option>
                </select>
                <input
                  type="text"
                  placeholder={t('hospital.doctors.degree')}
                  required
                  value={formData.degree}
                  onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                  className="px-4 py-2 border rounded-lg"
                />
                <input
                  type="text"
                  placeholder={t('hospital.doctors.licenseNumber')}
                  required
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                  className="px-4 py-2 border rounded-lg"
                />
                <input
                  type="text"
                  placeholder={t('hospital.doctors.experience')}
                  required
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  className="px-4 py-2 border rounded-lg"
                />
                <input
                  type="text"
                  placeholder={t('hospital.doctors.addressLine1')}
                  required
                  value={formData.address.line1}
                  onChange={(e) => setFormData({ ...formData, address: { ...formData.address, line1: e.target.value } })}
                  className="px-4 py-2 border rounded-lg"
                />
              </div>
              <textarea
                placeholder={t('hospital.doctors.about')}
                required
                value={formData.about}
                onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                rows={3}
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                className="px-4 py-2 border rounded-lg w-full"
              />
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-[#006838] text-white rounded-lg hover:bg-[#004d2a] disabled:opacity-50"
                >
                  {loading ? <LoadingComponents.ButtonLoader /> : editingDoctor ? t('hospital.doctors.update') : t('hospital.doctors.create')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!editingDoctor) {
                      try { localStorage.removeItem(HOSPITAL_DOCTOR_DRAFT_KEY); } catch { }
                    }
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  {t('hospital.doctors.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalDoctors;

