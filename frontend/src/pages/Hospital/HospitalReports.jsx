import React, { useContext, useEffect, useMemo, useState } from 'react';
import { HospitalContext } from '../../context/HospitalContext';
import { useTranslation } from 'react-i18next';
import { LoadingComponents } from '../../components/LoadingComponents';
import { downloadExcelXml, printHtmlToPdf, safeText } from '../../utils/exportUtils';

const HospitalReports = () => {
  const { hToken, doctors, patients, transfers, getHospitalDoctors, getHospitalPatients, getHospitalTransfers, loading, hospital } = useContext(HospitalContext);
  const { t } = useTranslation();
  const [localLoading, setLocalLoading] = useState(false);
  const [firstLoadDone, setFirstLoadDone] = useState(false);

  useEffect(() => {
    if (!hToken) return;

    const run = async () => {
      setLocalLoading(true);
      try {
        await Promise.all([
          getHospitalDoctors?.(),
          getHospitalPatients?.(),
          getHospitalTransfers?.()
        ]);
      } finally {
        setLocalLoading(false);
        setFirstLoadDone(true);
      }
    };

    run();
  }, [hToken]);

  const stats = useMemo(() => {
    const incoming = transfers?.incoming || [];
    const outgoing = transfers?.outgoing || [];
    return {
      doctors: doctors?.length || 0,
      patients: patients?.length || 0,
      incomingTransfers: incoming.length,
      outgoingTransfers: outgoing.length,
      pendingIncomingTransfers: incoming.filter((x) => x?.status === 'PENDING').length
    };
  }, [doctors, patients, transfers]);

  const exportAllExcel = () => {
    const doctorRows = (doctors || []).map((d) => ({
      Name: d?.name || '',
      Email: d?.email || '',
      Phone: d?.phone || '',
      Speciality: d?.speciality || '',
      Degree: d?.degree || '',
      Experience: d?.experience || '',
      LicenseNumber: d?.licenseNumber || ''
    }));

    const patientRows = (patients || []).map((p) => ({
      Name: p?.name || '',
      Email: p?.email || '',
      Phone: p?.phone || '',
      LastBookingDate: p?.lastBookingDate ? new Date(p.lastBookingDate).toLocaleDateString() : '',
      AppointmentsCount: p?.appointments?.length || 0
    }));

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
      fileName: `hospital_reports_${new Date().toISOString().slice(0, 10)}.xls`,
      sheets: [
        {
          name: 'Doctors',
          columns: ['Name', 'Email', 'Phone', 'Speciality', 'Degree', 'Experience', 'LicenseNumber'],
          rows: doctorRows
        },
        {
          name: 'Patients',
          columns: ['Name', 'Email', 'Phone', 'LastBookingDate', 'AppointmentsCount'],
          rows: patientRows
        },
        {
          name: 'Transfers_Incoming',
          columns: ['Direction', 'Status', 'FromHospital', 'FromDoctor', 'Patient', 'PatientEmail', 'Reason', 'Date'],
          rows: incomingRows
        },
        {
          name: 'Transfers_Outgoing',
          columns: ['Direction', 'Status', 'ToHospital', 'Patient', 'PatientEmail', 'Reason', 'Date'],
          rows: outgoingRows
        }
      ]
    });
  };

  const exportPdf = () => {
    const now = new Date();

    const header = `
      <h1>${safeText(t('hospital.reports.title') || 'Hospital reports')}</h1>
      <p class="muted">${safeText(hospital?.name || '')}</p>
      <p class="muted">Generated: ${safeText(now.toLocaleString())}</p>
    `;

    const summary = `
      <div class="section">
        <h2>Summary</h2>
        <table>
          <tbody>
            <tr><th>Doctors</th><td>${safeText(stats.doctors)}</td></tr>
            <tr><th>Patients</th><td>${safeText(stats.patients)}</td></tr>
            <tr><th>Incoming transfers</th><td>${safeText(stats.incomingTransfers)}</td></tr>
            <tr><th>Outgoing transfers</th><td>${safeText(stats.outgoingTransfers)}</td></tr>
            <tr><th>Pending incoming</th><td>${safeText(stats.pendingIncomingTransfers)}</td></tr>
          </tbody>
        </table>
      </div>
    `;

    const doctorPreview = (doctors || []).slice(0, 15);
    const patientPreview = (patients || []).slice(0, 15);
    const incomingPreview = (transfers?.incoming || []).slice(0, 15);
    const outgoingPreview = (transfers?.outgoing || []).slice(0, 15);

    const doctorsTable = `
      <div class="section">
        <h2>Doctors (top ${safeText(doctorPreview.length)})</h2>
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Speciality</th><th>Degree</th></tr></thead>
          <tbody>
            ${doctorPreview
        .map(
          (d) =>
            `<tr><td>${safeText(d?.name || '')}</td><td>${safeText(d?.email || '')}</td><td>${safeText(d?.speciality || '')}</td><td>${safeText(d?.degree || '')}</td></tr>`
        )
        .join('')}
          </tbody>
        </table>
      </div>
    `;

    const patientsTable = `
      <div class="section">
        <h2>Patients (top ${safeText(patientPreview.length)})</h2>
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Appointments</th></tr></thead>
          <tbody>
            ${patientPreview
        .map(
          (p) =>
            `<tr><td>${safeText(p?.name || '')}</td><td>${safeText(p?.email || '')}</td><td>${safeText(p?.phone || '')}</td><td>${safeText(p?.appointments?.length || 0)}</td></tr>`
        )
        .join('')}
          </tbody>
        </table>
      </div>
    `;

    const incomingTable = `
      <div class="section">
        <h2>Incoming transfers (top ${safeText(incomingPreview.length)})</h2>
        <table>
          <thead><tr><th>Status</th><th>From hospital</th><th>Patient</th><th>Reason</th><th>Date</th></tr></thead>
          <tbody>
            ${incomingPreview
        .map(
          (tr) =>
            `<tr><td>${safeText(tr?.status || '')}</td><td>${safeText(tr?.fromHospital?.name || 'Independent Practice')}</td><td>${safeText(tr?.patientId?.name || '')}</td><td>${safeText(tr?.reason || '')}</td><td>${safeText(tr?.createdAt ? new Date(tr.createdAt).toLocaleString() : '')}</td></tr>`
        )
        .join('')}
          </tbody>
        </table>
      </div>
    `;

    const outgoingTable = `
      <div class="section">
        <h2>Outgoing transfers (top ${safeText(outgoingPreview.length)})</h2>
        <table>
          <thead><tr><th>Status</th><th>To hospital</th><th>Patient</th><th>Reason</th><th>Date</th></tr></thead>
          <tbody>
            ${outgoingPreview
        .map(
          (tr) =>
            `<tr><td>${safeText(tr?.status || '')}</td><td>${safeText(tr?.toHospital?.name || '')}</td><td>${safeText(tr?.patientId?.name || '')}</td><td>${safeText(tr?.reason || '')}</td><td>${safeText(tr?.createdAt ? new Date(tr.createdAt).toLocaleString() : '')}</td></tr>`
        )
        .join('')}
          </tbody>
        </table>
      </div>
    `;

    printHtmlToPdf({
      title: `hospital_reports_${new Date().toISOString().slice(0, 10)}`,
      html: header + summary + doctorsTable + patientsTable + incomingTable + outgoingTable
    });
  };

  const hasAnyData = !!(doctors?.length || patients?.length || transfers?.incoming?.length || transfers?.outgoing?.length);
  const isInitialLoading = !firstLoadDone && (loading || localLoading) && !hasAnyData;

  if (isInitialLoading) {
    return <LoadingComponents.DashboardLoader text={t('hospital.dashboard.loading') || 'Loading dashboard...'} />;
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{t('hospital.reports.title') || 'Reports'}</h2>
          <p className="text-sm text-gray-500">{t('hospital.reports.subtitle') || 'Export hospital activity summaries for auditing and sharing.'}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={exportAllExcel}
            className="px-4 py-2 bg-[#006838] text-white rounded-lg hover:bg-[#004d2a] transition-colors"
          >
            {t('hospital.reports.exportExcel') || 'Export Excel'}
          </button>
          <button
            onClick={exportPdf}
            className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {t('hospital.reports.exportPdf') || 'Export PDF'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs   tracking-wider text-gray-500">Doctors</p>
          <p className="text-2xl font-bold text-gray-900">{stats.doctors}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs   tracking-wider text-gray-500">Patients</p>
          <p className="text-2xl font-bold text-gray-900">{stats.patients}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs   tracking-wider text-gray-500">Incoming</p>
          <p className="text-2xl font-bold text-gray-900">{stats.incomingTransfers}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs   tracking-wider text-gray-500">Outgoing</p>
          <p className="text-2xl font-bold text-gray-900">{stats.outgoingTransfers}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs   tracking-wider text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-gray-900">{stats.pendingIncomingTransfers}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <p className="text-sm font-semibold text-gray-900">{t('hospital.reports.preview') || 'Preview'}</p>
          <p className="text-xs text-gray-500">{t('hospital.reports.previewSubtitle') || 'A quick snapshot (full export is available in PDF/Excel).'}</p>
        </div>
        <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-2">Doctors</p>
            <div className="space-y-2">
              {(doctors || []).slice(0, 6).map((d) => (
                <div key={d?._id} className="flex items-center justify-between border border-gray-100 rounded-lg px-3 py-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{d?.name || '—'}</p>
                    <p className="text-xs text-gray-500 truncate">{d?.speciality || '—'}</p>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{d?.degree || ''}</p>
                </div>
              ))}
              {(!doctors || doctors.length === 0) && <p className="text-sm text-gray-500">No doctors.</p>}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-900 mb-2">Transfers</p>
            <div className="space-y-2">
              {(transfers?.incoming || []).slice(0, 3).map((tr) => (
                <div key={tr?._id} className="border border-gray-100 rounded-lg px-3 py-2">
                  <p className="text-sm font-medium text-gray-900">{tr?.patientId?.name || '—'}</p>
                  <p className="text-xs text-gray-500">Incoming • {tr?.status || '—'}</p>
                </div>
              ))}
              {(transfers?.outgoing || []).slice(0, 3).map((tr) => (
                <div key={tr?._id} className="border border-gray-100 rounded-lg px-3 py-2">
                  <p className="text-sm font-medium text-gray-900">{tr?.patientId?.name || '—'}</p>
                  <p className="text-xs text-gray-500">Outgoing • {tr?.status || '—'}</p>
                </div>
              ))}
              {(!transfers?.incoming?.length && !transfers?.outgoing?.length) && <p className="text-sm text-gray-500">No transfers.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalReports;
