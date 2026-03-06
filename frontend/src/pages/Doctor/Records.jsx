import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { DoctorContext } from '../../context/DoctorContext';
import { AppContext } from '../../context/AppContext';
import { useTranslation } from 'react-i18next';
import DoctorSkeletonLoaders from '../../components/DoctorSkeletonLoaders';
import EmptyState from '../../components/EmptyState';
import AISuggestionButton from '../../components/AISuggestionButton';

const Records = () => {
  const { backendUrl, dToken } = useContext(DoctorContext);
  const { currency } = useContext(AppContext);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    appointmentId: '',
    recordType: 'consultation',
    title: '',
    description: '',
    attachments: []
  });
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setPageLoading(true);
      const { data } = await axios.get(
        backendUrl + '/api/doctor/records',
        { headers: { dToken } }
      );

      if (data.success) {
        setRecords(data.records);
      } else {
        toast.error(data.message || 'Failed to fetch records');
      }
    } catch (error) {
      console.error('Error fetching records:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch records');
    } finally {
      setPageLoading(false);
    }
  };

  if (pageLoading && !showForm) {
    return <DoctorSkeletonLoaders.RecordsSkeleton />;
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.appointmentId || !formData.title) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const formDataToSend = new FormData();
      formDataToSend.append('appointmentId', formData.appointmentId);
      formDataToSend.append('recordType', formData.recordType);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);

      selectedFiles.forEach((file) => {
        formDataToSend.append('attachments', file);
      });

      const { data } = await axios.post(
        backendUrl + '/api/doctor/record/create',
        formDataToSend,
        {
          headers: {
            dToken,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (data.success) {
        toast.success('Record created successfully');
        setShowForm(false);
        setFormData({
          appointmentId: '',
          recordType: 'consultation',
          title: '',
          description: '',
          attachments: []
        });
        setSelectedFiles([]);
        fetchRecords();
      } else {
        toast.error(data.message || 'Failed to create record');
      }
    } catch (error) {
      console.error('Error creating record:', error);
      toast.error(error.response?.data?.message || 'Failed to create record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-gray-50 min-h-screen p-3 sm:p-4 lg:p-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">{t('doctor.recordsPage.title')}</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 sm:px-6 py-2 bg-[#006838] hover:bg-[#004d2a] text-white rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 shadow-md w-full sm:w-auto"
        >
          {showForm ? t('doctor.recordsPage.cancel') : t('doctor.recordsPage.createRecord')}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">{t('doctor.recordsPage.createNewRecord')}</h3>
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('doctor.recordsPage.appointmentId')}
              </label>
              <input
                type="text"
                value={formData.appointmentId}
                onChange={(e) => setFormData({ ...formData, appointmentId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006838]"
                placeholder={t('doctor.recordsPage.appointmentIdPlaceholder')}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('doctor.recordsPage.recordType')}
              </label>
              <select
                value={formData.recordType}
                onChange={(e) => setFormData({ ...formData, recordType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006838]"
                required
              >
                <option value="consultation">{t('doctor.recordsPage.consultation')}</option>
                <option value="prescription">{t('doctor.recordsPage.prescription')}</option>
                <option value="lab_result">{t('doctor.recordsPage.labResult')}</option>
                <option value="diagnosis">{t('doctor.recordsPage.diagnosis')}</option>
                <option value="other">{t('doctor.recordsPage.other')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('doctor.recordsPage.recordTitleLabel')}
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006838]"
                placeholder={t('doctor.recordsPage.titlePlaceholder')}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('doctor.recordsPage.descriptionLabel')}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006838]"
                rows="4"
                placeholder={t('doctor.recordsPage.descriptionPlaceholder')}
              />
              <AISuggestionButton
                context={`${formData.recordType} record: ${formData.title}. ${formData.description}`}
                fieldType="description"
                onSuggestion={(suggestion) => setFormData({ ...formData, description: suggestion })}
                backendUrl={backendUrl}
                token={dToken}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('doctor.recordsPage.attachments')}
              </label>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-100 file:text-[#004d2a] hover:file:bg-emerald-200"
              />
              {selectedFiles.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-gray-600">{t('doctor.recordsPage.selectedFiles')} {selectedFiles.length}</p>
                  <ul className="text-xs text-gray-500 mt-1">
                    {selectedFiles.map((file, index) => (
                      <li key={index}>• {file.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-gradient-to-r from-[#006838] to-[#004d2a] hover:from-[#004d2a] hover:to-[#006838] text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-md"
            >
              {loading ? t('doctor.recordsPage.creating') : t('doctor.recordsPage.createRecord')}
            </button>
          </form>
        </div>
      )}

      {loading && !showForm ? (
        <div className="bg-white rounded-xl p-8 sm:p-12 shadow-sm text-center">
          <p className="text-sm sm:text-base text-gray-500">{t('doctor.recordsPage.loading')}</p>
        </div>
      ) : records.length === 0 ? (
        <div className="bg-white p-8 sm:p-12 rounded-xl shadow-sm">
          <EmptyState variant="data" message={t('doctor.recordsPage.noRecords')} />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-[10px] sm:text-xs font-semibold text-gray-700 uppercase">{t('doctor.recordsPage.appointmentId')}</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-[10px] sm:text-xs font-semibold text-gray-700 uppercase">{t('doctor.recordsPage.type')}</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-[10px] sm:text-xs font-semibold text-gray-700 uppercase">{t('doctor.recordsPage.recordTitleLabel')}</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-[10px] sm:text-xs font-semibold text-gray-700 uppercase">{t('doctor.recordsPage.attachments')}</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-[10px] sm:text-xs font-semibold text-gray-700 uppercase">{t('doctor.prescriptionsPage.date')}</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-[10px] sm:text-xs font-semibold text-gray-700 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {records.map((record) => (
                  <tr key={record._id} className="hover:bg-emerald-50 transition-all">
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                      {record.appointmentId}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                      <span className="px-2 py-1 text-[10px] sm:text-xs font-medium rounded-full bg-emerald-100 text-[#006838] border border-emerald-200">
                        {record.recordType}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900">
                      {record.title}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                      {record.attachments?.length || 0} {t('doctor.recordsPage.files')}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                      {new Date(record.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                      <button
                        onClick={() => navigate(`/doctor-reports?patientId=${record.userId?._id || record.userId}`)}
                        className="text-xs text-[#006838] font-medium hover:underline"
                      >
                        Patient Report
                      </button>
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

export default Records;

