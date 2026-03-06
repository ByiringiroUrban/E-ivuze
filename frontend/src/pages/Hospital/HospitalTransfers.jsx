import React, { useEffect, useContext, useState } from 'react';
import { HospitalContext } from '../../context/HospitalContext';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { downloadExcelXml } from '../../utils/exportUtils';

const HospitalTransfers = () => {
  const { transfers, getHospitalTransfers, createTransfer, acceptTransfer, rejectTransfer, approvedHospitals, getApprovedHospitals, getHospitalPatients, patients } = useContext(HospitalContext);
  const { t } = useTranslation();
  const location = useLocation();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [transferForm, setTransferForm] = useState({
    patientId: '',
    toHospitalId: '',
    reason: ''
  });

  const exportTransfers = () => {
    const incomingRows = (transfers?.incoming || []).map((tr) => ({
      Direction: 'Incoming',
      Status: tr?.status || '',
      FromHospital: tr?.fromHospital?.name || 'Independent Practice',
      FromDoctor: tr?.fromDoctor?.name || '',
      Patient: tr?.patientId?.name || '',
      PatientEmail: tr?.patientId?.email || '',
      Reason: tr?.reason || '',
      Date: tr?.createdAt ? new Date(tr.createdAt).toLocaleString() : ''
    }));

    const outgoingRows = (transfers?.outgoing || []).map((tr) => ({
      Direction: 'Outgoing',
      Status: tr?.status || '',
      ToHospital: tr?.toHospital?.name || '',
      Patient: tr?.patientId?.name || '',
      PatientEmail: tr?.patientId?.email || '',
      Reason: tr?.reason || '',
      Date: tr?.createdAt ? new Date(tr.createdAt).toLocaleString() : ''
    }));

    downloadExcelXml({
      fileName: `hospital_transfers_${new Date().toISOString().slice(0, 10)}.xls`,
      sheets: [
        {
          name: 'Incoming',
          columns: ['Direction', 'Status', 'FromHospital', 'FromDoctor', 'Patient', 'PatientEmail', 'Reason', 'Date'],
          rows: incomingRows
        },
        {
          name: 'Outgoing',
          columns: ['Direction', 'Status', 'ToHospital', 'Patient', 'PatientEmail', 'Reason', 'Date'],
          rows: outgoingRows
        }
      ]
    });
  };

  useEffect(() => {
    getHospitalTransfers();
    getApprovedHospitals();
    getHospitalPatients();

    // If navigated from patients page with patientId
    if (location.state?.patientId) {
      setTransferForm({ ...transferForm, patientId: location.state.patientId });
      setShowCreateModal(true);
    }
  }, []);

  const handleCreateTransfer = async (e) => {
    e.preventDefault();
    const result = await createTransfer(transferForm);
    if (result.success) {
      setShowCreateModal(false);
      setTransferForm({ patientId: '', toHospitalId: '', reason: '' });
    }
  };

  const handleAccept = async (transferId) => {
    const notes = window.prompt(t('hospital.transfers.enterAcceptNotes') || "Enter acceptance notes (optional):");
    if (notes !== null) {
      await acceptTransfer(transferId, notes);
    }
  };

  const handleReject = async (transferId) => {
    const reason = window.prompt(t('hospital.transfers.enterRejectReason') || "Enter reason for rejection:");
    if (reason) {
      await rejectTransfer(transferId, reason);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{t('hospital.transfers.title')}</h2>
        <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={exportTransfers}
            className="w-full sm:w-auto px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {t('hospital.reports.exportExcel') || 'Export Excel'}
          </button>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="w-full sm:w-auto px-4 py-2 bg-[#006838] text-white rounded-lg hover:bg-[#004d2a] transition-colors"
          >
            {t('hospital.transfers.createTransfer')}
          </button>
        </div>
      </div>

      {/* Incoming Transfers */}
      <div className="mb-8">
        <h3 className="text-lg sm:text-xl font-semibold mb-4">{t('hospital.transfers.incomingTransfers')}</h3>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('hospital.transfers.fromHospital')}</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('hospital.transfers.patient')}</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('hospital.transfers.reason')}</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('hospital.transfers.status')}</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('hospital.transfers.actions')}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transfers.incoming?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                      {t('hospital.transfers.noIncoming') || 'No incoming transfers'}
                    </td>
                  </tr>
                ) : (
                  transfers.incoming?.map(transfer => (
                    <tr key={transfer._id} className="hover:bg-gray-50">
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                        <p className="font-medium text-gray-900">{transfer.fromHospital?.name || 'Independent Practice'}</p>
                        <p className="text-xs text-gray-500">By {transfer.fromDoctor?.name || 'Unknown Doctor'}</p>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <img src={transfer.patientId?.image} alt="" className="w-8 h-8 rounded-full border shadow-sm object-cover" />
                          <span>{transfer.patientId?.name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm break-words">{transfer.reason}</td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${transfer.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          transfer.status === 'ACCEPTED' ? 'bg-emerald-100 text-[#006838]' :
                            'bg-red-100 text-red-800'
                          }`}>
                          {transfer.status}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                        {transfer.status === 'PENDING' && (
                          <div className="flex flex-col sm:flex-row gap-2">
                            <button
                              onClick={() => handleAccept(transfer._id)}
                              className="px-3 py-1 bg-[#006838] text-white rounded hover:bg-[#004d2a] text-xs"
                            >
                              {t('hospital.transfers.accept')}
                            </button>
                            <button
                              onClick={() => handleReject(transfer._id)}
                              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                            >
                              {t('hospital.transfers.reject')}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Outgoing Transfers */}
      <div>
        <h3 className="text-lg sm:text-xl font-semibold mb-4">{t('hospital.transfers.outgoingTransfers')}</h3>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('hospital.transfers.toHospital')}</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('hospital.transfers.patient')}</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('hospital.transfers.reason')}</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('hospital.transfers.status')}</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('hospital.transfers.date')}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transfers.outgoing?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                      {t('hospital.transfers.noOutgoing') || 'No outgoing transfers'}
                    </td>
                  </tr>
                ) : (
                  transfers.outgoing?.map(transfer => (
                    <tr key={transfer._id} className="hover:bg-gray-50">
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                        {transfer.toHospital?.name || 'Unknown'}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <img src={transfer.patientId?.image} alt="" className="w-8 h-8 rounded-full border shadow-sm object-cover" />
                          <span>{transfer.patientId?.name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm break-words">{transfer.reason}</td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${transfer.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          transfer.status === 'ACCEPTED' ? 'bg-emerald-100 text-[#006838]' :
                            'bg-red-100 text-red-800'
                          }`}>
                          {transfer.status}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                        {new Date(transfer.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Transfer Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg sm:text-xl font-bold mb-4">{t('hospital.transfers.createTransfer')}</h3>
            <form onSubmit={handleCreateTransfer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('hospital.transfers.selectPatient')} *</label>
                <select
                  required
                  value={transferForm.patientId}
                  onChange={(e) => setTransferForm({ ...transferForm, patientId: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="">{t('hospital.transfers.selectPatient')}</option>
                  {patients.map(patient => (
                    <option key={patient._id} value={patient._id}>
                      {patient.name} ({patient.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('hospital.transfers.targetHospital')}</label>
                <select
                  required
                  value={transferForm.toHospitalId}
                  onChange={(e) => setTransferForm({ ...transferForm, toHospitalId: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="">{t('hospital.transfers.selectHospital')}</option>
                  {approvedHospitals.map(hospital => (
                    <option key={hospital._id} value={hospital._id}>
                      {hospital.name} - {hospital.address?.city || ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('hospital.transfers.reason')} *</label>
                <textarea
                  required
                  value={transferForm.reason}
                  onChange={(e) => setTransferForm({ ...transferForm, reason: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows={3}
                  placeholder={t('hospital.transfers.enterReason')}
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#006838] text-white rounded-lg hover:bg-[#004d2a]"
                >
                  {t('hospital.transfers.create')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setTransferForm({ patientId: '', toHospitalId: '', reason: '' });
                  }}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  {t('hospital.transfers.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalTransfers;

