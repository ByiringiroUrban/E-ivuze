import React, { useEffect, useContext, useState } from 'react';
import { HospitalContext } from '../../context/HospitalContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LoadingComponents } from '../../components/LoadingComponents';
import { downloadExcelXml } from '../../utils/exportUtils';

const HospitalPatients = () => {
  const { patients, getHospitalPatients, loading } = useContext(HospitalContext);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedPatient, setSelectedPatient] = useState(null);

  const exportPatients = () => {
    const rows = (patients || []).map((p) => ({
      Name: p?.name || '',
      Email: p?.email || '',
      Phone: p?.phone || '',
      LastBookingDate: p?.lastBookingDate ? new Date(p.lastBookingDate).toLocaleDateString() : '',
      AppointmentsCount: p?.appointments?.length || 0
    }));

    downloadExcelXml({
      fileName: `hospital_patients_${new Date().toISOString().slice(0, 10)}.xls`,
      sheets: [
        {
          name: 'Patients',
          columns: ['Name', 'Email', 'Phone', 'LastBookingDate', 'AppointmentsCount'],
          rows
        }
      ]
    });
  };

  useEffect(() => {
    getHospitalPatients();
  }, []);

  const handleCreateTransfer = (patient) => {
    navigate('/hospital-dashboard/transfers', { state: { patientId: patient._id } });
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{t('hospital.patients.title')}</h2>
        <button
          type="button"
          onClick={exportPatients}
          className="w-full sm:w-auto px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          {t('hospital.reports.exportExcel') || 'Export Excel'}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500  ">{t('hospital.patients.name')}</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500  ">{t('hospital.patients.email')}</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500  ">{t('hospital.patients.phone')}</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500  ">{t('hospital.patients.lastBooking')}</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500  ">{t('hospital.patients.appointments')}</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500  ">{t('hospital.patients.actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading && patients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8">
                    <LoadingComponents.DataLoader />
                  </td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                    {t('hospital.dashboard.noPatients')}
                  </td>
                </tr>
              ) : (
                patients.map(patient => (
                  <tr key={patient._id} className="hover:bg-gray-50">
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {patient.name}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.email}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.phone || 'N/A'}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.lastBookingDate ? new Date(patient.lastBookingDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.appointments?.length || 0}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => setSelectedPatient(patient)}
                          className="text-[#006838] hover:text-[#004d2a]"
                        >
                          {t('hospital.patients.view')}
                        </button>
                        <button
                          onClick={() => handleCreateTransfer(patient)}
                          className="text-[#006838] hover:text-[#004d2a]"
                        >
                          {t('hospital.patients.transfer')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Patient Detail Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg sm:text-xl font-bold mb-4">{t('hospital.patients.patientDetails')}</h3>
            <div className="space-y-2">
              <p><strong>{t('hospital.patients.name')}:</strong> {selectedPatient.name}</p>
              <p><strong>{t('hospital.patients.email')}:</strong> {selectedPatient.email}</p>
              <p><strong>{t('hospital.patients.phone')}:</strong> {selectedPatient.phone || 'N/A'}</p>
              <p><strong>{t('hospital.patients.address')}:</strong> {selectedPatient.address?.line1 || 'N/A'}</p>
            </div>
            <h4 className="font-semibold mt-4 mb-2">{t('hospital.patients.appointmentsList')}</h4>
            <div className="space-y-2">
              {selectedPatient.appointments?.map(apt => (
                <div key={apt._id} className="border p-2 rounded">
                  <p><strong>{t('hospital.patients.date')}</strong> {apt.date}</p>
                  <p><strong>{t('hospital.patients.time')}</strong> {apt.time}</p>
                  <p><strong>{t('hospital.patients.doctorName')}</strong> {apt.doctorName}</p>
                  <p><strong>{t('hospital.patients.status')}</strong> {apt.status}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setSelectedPatient(null)}
              className="mt-4 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              {t('hospital.patients.close')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalPatients;

