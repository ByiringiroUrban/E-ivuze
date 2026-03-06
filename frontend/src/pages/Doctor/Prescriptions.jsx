import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { DoctorContext } from '../../context/DoctorContext';
import { AppContext } from '../../context/AppContext';
import { useTranslation } from 'react-i18next';
import DoctorSkeletonLoaders from '../../components/DoctorSkeletonLoaders';
import EmptyState from '../../components/EmptyState';

const Prescriptions = () => {
  const { backendUrl, dToken, appointments, getAppointments } = useContext(DoctorContext);
  const { currency, slotDateFormat } = useContext(AppContext);
  const { t } = useTranslation();
  const [prescriptions, setPrescriptions] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    appointmentId: '',
    medications: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
    diagnosis: '',
    notes: '',
    followUpDate: ''
  });
  const [prescriptionFile, setPrescriptionFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  useEffect(() => {
    fetchPrescriptions();
    if (dToken) {
      getAppointments();
    }
  }, [dToken]);

  const fetchPrescriptions = async () => {
    try {
      setPageLoading(true);
      const { data } = await axios.get(
        backendUrl + '/api/doctor/prescriptions',
        { headers: { dToken } }
      );

      if (data.success) {
        setPrescriptions(data.prescriptions);
      } else {
        toast.error(data.message || 'Failed to fetch prescriptions');
      }
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch prescriptions');
    } finally {
      setPageLoading(false);
    }
  };

  if (pageLoading && !showForm) {
    return <DoctorSkeletonLoaders.PrescriptionsSkeleton />;
  }

  const handleAddMedication = () => {
    setFormData({
      ...formData,
      medications: [...formData.medications, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]
    });
  };

  const handleRemoveMedication = (index) => {
    const newMedications = formData.medications.filter((_, i) => i !== index);
    setFormData({ ...formData, medications: newMedications });
  };

  const handleMedicationChange = (index, field, value) => {
    const newMedications = [...formData.medications];
    newMedications[index][field] = value;
    setFormData({ ...formData, medications: newMedications });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      // Check file type
      if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
        toast.error('Only image and PDF files are allowed');
        return;
      }
      setPrescriptionFile(file);
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleRemoveFile = () => {
    setPrescriptionFile(null);
    setFilePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.appointmentId) {
      toast.error('Please select an appointment');
      return;
    }

    // Allow submission with either medications OR file
    if (!prescriptionFile && (formData.medications.length === 0 || formData.medications.some(m => !m.name || !m.dosage))) {
      toast.error('Please add at least one medication with name and dosage, or upload a prescription file');
      return;
    }

    try {
      setLoading(true);

      // Create FormData for file upload
      const submitData = new FormData();

      // Always append appointmentId first
      if (!formData.appointmentId) {
        toast.error('Please select an appointment');
        return;
      }
      submitData.append('appointmentId', formData.appointmentId);

      // docId will be extracted from dToken in backend middleware

      // Append medications if provided (even if file is also provided)
      if (formData.medications && formData.medications.length > 0) {
        submitData.append('medications', JSON.stringify(formData.medications));
      }

      // Append other fields
      if (formData.diagnosis) {
        submitData.append('diagnosis', formData.diagnosis);
      }
      if (formData.notes) {
        submitData.append('notes', formData.notes);
      }
      if (formData.followUpDate) {
        submitData.append('followUpDate', formData.followUpDate);
      }

      // Append file if provided
      if (prescriptionFile) {
        submitData.append('prescriptionFile', prescriptionFile);
      }

      const { data } = await axios.post(
        backendUrl + '/api/doctor/prescription/create',
        submitData,
        {
          headers: {
            dToken,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (data.success) {
        toast.success('Prescription created successfully');
        setShowForm(false);
        setFormData({
          appointmentId: '',
          medications: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
          diagnosis: '',
          notes: '',
          followUpDate: ''
        });
        setPrescriptionFile(null);
        setFilePreview(null);
        setSelectedAppointment(null);
        fetchPrescriptions();
      } else {
        toast.error(data.message || 'Failed to create prescription');
      }
    } catch (error) {
      console.error('Error creating prescription:', error);
      toast.error(error.response?.data?.message || 'Failed to create prescription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-gray-50 min-h-screen p-3 sm:p-4 lg:p-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">{t('doctor.prescriptionsPage.title')}</h2>
        <button
          onClick={() => {
            if (showForm) {
              setFormData({
                appointmentId: '',
                medications: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
                diagnosis: '',
                notes: '',
                followUpDate: ''
              });
              setSelectedAppointment(null);
            }
            setShowForm(!showForm);
          }}
          className="px-4 sm:px-6 py-2 bg-[#006838] hover:bg-[#004d2a] text-white rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 shadow-md w-full sm:w-auto"
        >
          {showForm ? t('doctor.prescriptionsPage.cancel') : t('doctor.prescriptionsPage.createPrescription')}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">{t('doctor.prescriptionsPage.createNewPrescription')}</h3>
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                {t('doctor.prescriptionsPage.selectAppointment')}
              </label>
              <select
                value={formData.appointmentId}
                onChange={(e) => {
                  const appointmentId = e.target.value;
                  const appointment = appointments.find(apt => apt._id === appointmentId);
                  setFormData({ ...formData, appointmentId });
                  setSelectedAppointment(appointment || null);
                }}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006838]"
                required
              >
                <option value="">{t('doctor.prescriptionsPage.selectAppointmentPlaceholder')}</option>
                {Array.isArray(appointments) && appointments.length > 0 ? (
                  appointments
                    .filter(apt => apt.approvalStatus === 'approved' && !apt.cancelled)
                    .map((appointment) => (
                      <option key={appointment._id} value={appointment._id}>
                        {appointment.userData?.name || 'Patient'} - {slotDateFormat(appointment.slotDate)} at {appointment.slotTime} {appointment.paymentStatus === 'approved' || appointment.payment ? '(Paid)' : '(Not Paid)'}
                      </option>
                    ))
                ) : (
                  <option value="" disabled>{t('doctor.prescriptionsPage.noApprovedAppointments')}</option>
                )}
              </select>
              {selectedAppointment && (
                <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <p className="text-sm font-medium text-gray-800">{t('doctor.prescriptionsPage.patientInformation')}</p>
                  <div className="mt-2 space-y-1 text-sm text-gray-600">
                    <p><span className="font-medium">{t('doctor.prescriptionsPage.name')}</span> {selectedAppointment.userData?.name || 'N/A'}</p>
                    <p><span className="font-medium">{t('doctor.prescriptionsPage.email')}</span> {selectedAppointment.userData?.email || 'N/A'}</p>
                    <p><span className="font-medium">{t('doctor.prescriptionsPage.phone')}</span> {selectedAppointment.userData?.phone || 'N/A'}</p>
                    <p><span className="font-medium">{t('doctor.prescriptionsPage.dateTime')}</span> {slotDateFormat(selectedAppointment.slotDate)} at {selectedAppointment.slotTime}</p>
                    <p><span className="font-medium">{t('doctor.prescriptionsPage.paymentStatus')}</span>
                      <span className={`ml-2 px-2 py-1 roun text-xs ${selectedAppointment.paymentStatus === 'approved' || selectedAppointment.payment
                        ? 'bg-emerald-100 text-[#006838] border border-emerald-300'
                        : 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                        }`}>
                        {selectedAppointment.paymentStatus === 'approved' || selectedAppointment.payment ? t('doctor.prescriptionsPage.paid') : t('doctor.prescriptionsPage.notPaid')}
                      </span>
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('doctor.prescriptionsPage.diagnosis')}
              </label>
              <textarea
                value={formData.diagnosis}
                onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006838]"
                rows="3"
                placeholder={t('doctor.prescriptionsPage.diagnosisPlaceholder')}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  {t('doctor.prescriptionsPage.medications')}
                </label>
                <button
                  type="button"
                  onClick={handleAddMedication}
                  className="text-sm text-[#006838] hover:text-[#004d2a]"
                >
                  {t('doctor.prescriptionsPage.addMedication')}
                </button>
              </div>
              {formData.medications.map((med, index) => (
                <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">{t('doctor.prescriptionsPage.medication')} {index + 1}</span>
                    {formData.medications.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMedication(index)}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        {t('doctor.prescriptionsPage.remove')}
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    <div>
                      <input
                        type="text"
                        value={med.name}
                        onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006838]"
                        placeholder={t('doctor.prescriptionsPage.medicationName')}
                        required
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={med.dosage}
                        onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006838]"
                        placeholder={t('doctor.prescriptionsPage.dosage')}
                        required
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={med.frequency}
                        onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006838]"
                        placeholder={t('doctor.prescriptionsPage.frequency')}
                        required
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={med.duration}
                        onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006838]"
                        placeholder={t('doctor.prescriptionsPage.duration')}
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <textarea
                        value={med.instructions}
                        onChange={(e) => handleMedicationChange(index, 'instructions', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006838]"
                        placeholder={t('doctor.prescriptionsPage.specialInstructions')}
                        rows="2"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('doctor.prescriptionsPage.notes')}
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006838]"
                rows="3"
                placeholder={t('doctor.prescriptionsPage.notesPlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('doctor.prescriptionsPage.followUpDate')}
              </label>
              <input
                type="date"
                value={formData.followUpDate}
                onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006838]"
              />
            </div>

            {/* Prescription File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Prescription File (Optional - Image or PDF)
              </label>
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006838] text-sm"
                />
                {filePreview && (
                  <div className="relative">
                    <img
                      src={filePreview}
                      alt="Prescription preview"
                      className="max-w-full h-48 object-contain border border-gray-300 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                )}
                {prescriptionFile && !filePreview && (
                  <div className="flex items-center justify-between p-2 bg-gray-100 rounded-lg">
                    <span className="text-sm text-gray-700">{prescriptionFile.name}</span>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                )}
                <p className="text-xs text-gray-500">
                  You can either fill in medications manually or upload a prescription file. Max size: 5MB
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-gradient-to-r from-[#006838] to-[#004d2a] hover:from-[#004d2a] hover:to-[#006838] text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-md"
            >
              {loading ? t('doctor.prescriptionsPage.creating') : t('doctor.prescriptionsPage.createPrescription')}
            </button>
          </form>
        </div>
      )}

      {loading && !showForm ? (
        <div className="bg-white rounded-xl p-8 sm:p-12 shadow-sm text-center">
          <p className="text-sm sm:text-base text-gray-500">{t('doctor.prescriptionsPage.loading')}</p>
        </div>
      ) : prescriptions.length === 0 ? (
        <div className="bg-white p-8 sm:p-12 rounded-xl shadow-sm">
          <EmptyState variant="data" message={t('doctor.prescriptionsPage.noPrescriptions')} />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-[10px] sm:text-xs font-semibold text-gray-700  ">{t('doctor.prescriptionsPage.appointmentId')}</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-[10px] sm:text-xs font-semibold text-gray-700  ">{t('doctor.prescriptionsPage.diagnosis')}</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-[10px] sm:text-xs font-semibold text-gray-700  ">{t('doctor.prescriptionsPage.medications')}</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-[10px] sm:text-xs font-semibold text-gray-700  ">{t('doctor.prescriptionsPage.followUp')}</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-[10px] sm:text-xs font-semibold text-gray-700  ">{t('doctor.prescriptionsPage.date')}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {prescriptions.map((prescription) => (
                  <tr key={prescription._id} className="hover:bg-emerald-50 transition-all">
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                      {prescription.appointmentId}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900">
                      {prescription.diagnosis || 'N/A'}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900">
                      {prescription.medications.length} {t('doctor.prescriptionsPage.medicationsCount')}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                      {prescription.followUpDate || 'N/A'}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                      {new Date(prescription.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Prescriptions;

