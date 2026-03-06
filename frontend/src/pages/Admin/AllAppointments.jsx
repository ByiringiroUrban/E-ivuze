import React, { useContext, useEffect } from "react";
import { AdminContext } from "../../context/AdminContext";
import { AppContext } from "../../context/AppContext";
import { useTranslation } from "react-i18next";
import LanguageSwitch from "../../components/LanguageSwitch";
import { LoadingComponents } from "../../components/LoadingComponents";
import EmptyState from "../../components/EmptyState";
import { getDoctorImageSrc } from "../../utils/doctorImage";

const AllAppointments = () => {
  const { aToken, appointments, getAllAppointments, cancelAppointment, loading } = useContext(AdminContext);
  const { calculateAge, slotDateFormat, currency } = useContext(AppContext);
  const { t } = useTranslation();

  useEffect(() => {
    if (aToken) {
      getAllAppointments();
    }
  }, [aToken, getAllAppointments]);

  if (loading && (!appointments || appointments.length === 0)) {
    // If it's truly empty after a while, maybe show no data, but initially show loader
    // For simplicity, we'll show loader if appointments is falsy or an empty array (initial state)
    return <LoadingComponents.DashboardLoader text={t('admin.dashboardLoading') || 'Loading dashboard...'} />;
  }

  const safeAppointments = Array.isArray(appointments) ? appointments : [];
  const orderedAppointments = safeAppointments.slice();

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="bg-[#14324f] text-white px-4 sm:px-8 lg:px-12 py-10 sm:py-14">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-widest text-white/70">{t('admin.allAppointments.title') || t('admin.allAppointmentsTitle') || 'All Appointments'}</p>
            <h1 className="text-3xl sm:text-4xl font-semibold">{t('admin.allAppointmentsTitle')}</h1>
            <p className="text-sm sm:text-base text-white/80 max-w-3xl">{t('admin.allAppointmentsSubtitle')}</p>
          </div>
          <LanguageSwitch />
        </div>
      </section>

      {/* Content Section */}
      <section className="py-10 sm:py-12">
        <div className="w-full px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm text-sm max-h-[80vh] min-h-[60vh] overflow-y-auto">
            {/* Desktop Headers */}
            <div className="hidden sm:grid grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] grid-flow-col py-3 px-6 border-b bg-gray-50 sticky top-0 z-10">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">#</p>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.allAppointments.patient')}</p>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.allAppointments.age')}</p>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.allAppointments.dateTime')}</p>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.allAppointments.doctor')}</p>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.allAppointments.fees')}</p>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.allAppointments.actions')}</p>
            </div>

            {orderedAppointments.length === 0 ? (
              <EmptyState variant="data" title={t('admin.allAppointments.noAppointments')} message="No appointments in the system" className="p-8" />
            ) : (
              orderedAppointments.map((item, index) => {
                const patient = item?.userData || item?.userId || {};
                const doctor = item?.docData || item?.docId || {};

                return (
                  <div
                    className="flex flex-wrap justify-between max-sm:gap-2 sm:grid sm:grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50 transition-colors"
                    key={item?._id || index}
                  >
                    <p className="max-sm:hidden text-sm">{index + 1}</p>
                    <div className="flex items-center gap-2 min-w-[220px]">
                      {patient.image ? (
                        <img
                          className="w-8 h-8 rounded-full object-cover"
                          src={patient.image}
                          alt={patient.name || 'Patient'}
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200" />
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{patient.name || '-'}</p>
                        <p className="text-xs text-gray-400 truncate sm:hidden">{patient.email || ''}</p>
                      </div>
                    </div>
                    <p className="max-sm:hidden text-sm">{patient.dob ? calculateAge(patient.dob) : '-'}</p>
                    <p className="text-sm">
                      {slotDateFormat(item.slotDate)}, {item.slotTime}
                    </p>
                    <div className="flex items-center gap-2 min-w-[220px]">
                      <img
                        className="w-8 h-8 rounded-full bg-gray-200 object-cover"
                        src={getDoctorImageSrc(doctor)}
                        alt={doctor.name || 'Doctor'}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{doctor.name || '-'}</p>
                        <p className="text-xs text-gray-400 truncate sm:hidden">{doctor.speciality || ''}</p>
                      </div>
                    </div>
                    <p className="text-sm font-medium">
                      {currency} {item.amount}
                    </p>
                    <div className="flex items-center justify-start sm:justify-center">
                      {item.cancelled ? (
                        <span className="px-2 py-1 rounded-md bg-red-50 text-red-600 text-xs font-medium">
                          {t('admin.allAppointments.cancelled')}
                        </span>
                      ) : item.isCompleted ? (
                        <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">
                          {t('admin.allAppointments.completed')}
                        </span>
                      ) : (
                        <button
                          onClick={() => cancelAppointment(item._id)}
                          className="px-3 py-1 rounded-md bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors"
                          title={t('admin.allAppointments.cancelAppointment')}
                        >
                          {t('buttons.cancel') || 'Cancel'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AllAppointments;
