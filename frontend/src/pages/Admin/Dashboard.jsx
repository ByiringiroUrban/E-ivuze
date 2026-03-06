import React, { useContext, useEffect, useMemo } from "react";
import { AdminContext } from "../../context/AdminContext";
import { assets } from "../../assets/assets";
import { AppContext } from "../../context/AppContext";
import { useTranslation } from "react-i18next";
import { FaChartBar, FaClipboardList, FaShoppingBag, FaUserPlus } from "react-icons/fa";
import { StatCard, VisitorInsightsChart, TotalRevenueChart, CustomerSatisfactionChart, TargetRealityChart, TopDoctors } from "../../components/DashboardCharts";
import { LoadingComponents } from "../../components/LoadingComponents";

const Dashboard = () => {
  const { aToken, getDashData, cancelAppointment, dashData, loading } = useContext(AdminContext);
  const { slotDateFormat } = useContext(AppContext);
  const { t } = useTranslation();

  useEffect(() => {
    if (aToken) {
      getDashData();
    }
  }, [aToken]);

  const stats = useMemo(() => ([
    { label: t('admin.doctorsList.title') || t('admin.doctorsListTitle') || 'Doctors List', value: dashData?.doctors || 0, icon: assets.doctor_icon },
    { label: t('admin.allAppointments.title') || t('admin.allAppointmentsTitle') || 'All Appointments', value: dashData?.appointments || 0, icon: assets.appointments_icon },
    { label: t('doctor.patients'), value: dashData?.patients || 0, icon: assets.patients_icon }
  ]), [dashData, t]);

  const latestAppointments = dashData?.latestAppointments || [];

  if (loading && !dashData) return <LoadingComponents.DashboardLoader text={t('admin.dashboardLoading') || 'Loading dashboard...'} />;

  return (
    <div className="bg-white min-h-screen">
      <section className="bg-white border-b border-gray-100 px-4 sm:px-8 lg:px-12 py-8">
        <div className="max-w-5xl space-y-1">
          <p className="text-xs tracking-widest text-[#064e3b] font-semibold uppercase">{t('admin.dashboardTitle') || 'Admin Dashboard'}</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            {t('admin.dashboardHero') || 'Manage your healthcare platform'}
          </h1>
          <p className="text-sm text-gray-500 max-w-3xl pt-1">
            {t('admin.dashboardSubhero') || 'Review onboarding stats, upcoming appointments and outstanding approvals from a single workspace.'}
          </p>
        </div>
      </section>

      <section className="py-10 sm:py-12">
        <div className="w-full px-4 sm:px-8 lg:px-12 space-y-10">
          {/* --- NEW DASHBOARD WIDGETS --- */}
          <div className="space-y-6">
            {/* 1. Stat Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                color="red"
                value={dashData?.doctors || 0}
                label={t('admin.doctorsList.title') || "Total Doctors"}
                icon={<FaChartBar />}
                subtext="+8% from yesterday"
              />
              <StatCard
                color="yellow"
                value={dashData?.appointments || 0}
                label={t('admin.allAppointments.title') || "Total Appointments"}
                icon={<FaClipboardList />}
                subtext="+5% from yesterday"
              />
              <StatCard
                color="green"
                value={dashData?.patients || 0}
                label={t('doctor.patients') || "Total Patients"}
                icon={<FaShoppingBag />}
                subtext="+1.2% from yesterday"
              />
              <StatCard
                color="purple"
                value={dashData?.requestsCount || 0}
                label="New Requests"
                icon={<FaUserPlus />}
                subtext="Pending Approvals"
              />
            </div>

            {/* 2. Charts Row 1: Insights & Revenue */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6">
              <VisitorInsightsChart data={dashData?.charts?.visitors} />
              <TotalRevenueChart data={dashData?.charts?.revenue} />
            </div>

            {/* 3. Charts Row 2: Satisfaction & Target */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <CustomerSatisfactionChart />
              <TargetRealityChart data={dashData?.charts?.target} />
              <TopDoctors data={dashData?.charts?.topDoctors} />
            </div>
          </div>
          {/* --- END WIDGETS --- */}

          <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6">
            <div className="border border-border bg-white shadow-sm">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <div>
                  <p className="text-xs   tracking-[0.35em] text-primary-dark">{t('admin.latestAppointments') || 'Latest appointments'}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('admin.latestAppointmentsSubtitle') || 'Most recent bookings across the network'}
                  </p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="text-xs   tracking-[0.25em] text-muted-foreground border-b border-border">
                    <tr>
                      <th className="text-left px-5 py-3">{t('doctor.doctor')}</th>
                      <th className="text-left px-5 py-3">{t('pages.appointment.bookingSlots')}</th>
                      <th className="text-left px-5 py-3">{t('doctor.patients')}</th>
                      <th className="text-left px-5 py-3">{t('app.status')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {latestAppointments.map((item, index) => (
                      <tr key={item._id || index} className="border-b border-border last:border-0">
                        <td className="px-5 py-3 text-accent font-medium">{item.docData?.name || '—'}</td>
                        <td className="px-5 py-3 text-muted-foreground">{slotDateFormat(item.slotDate)}</td>
                        <td className="px-5 py-3 text-muted-foreground">{item.userData?.name || '—'}</td>
                        <td className="px-5 py-3">
                          {item.cancelled ? (
                            <span className="text-xs   tracking-[0.35em] text-red-500">{t('doctor.dashboardCancelled')}</span>
                          ) : item.isCompleted ? (
                            <span className="text-xs   tracking-[0.35em] text-primary">{t('doctor.dashboardCompleted')}</span>
                          ) : (
                            <button
                              onClick={() => cancelAppointment(item._id)}
                              className="text-xs   tracking-[0.35em] text-primary hover:underline"
                            >
                              {t('buttons.cancel')}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {latestAppointments.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-5 py-6 text-center text-muted-foreground text-sm">
                          {t('admin.noAppointments') || 'No appointments yet.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="border border-border bg-white shadow-sm p-5 space-y-5">
              <div>
                <p className="text-xs   tracking-[0.35em] text-primary-dark">{t('admin.quickActions') || 'Quick actions'}</p>
                <p className="text-sm text-muted-foreground">{t('admin.quickActionsSubtitle')}</p>
              </div>
              <div className="space-y-3">
                {[
                  t('admin.addDoctor') || 'Add doctor',
                  t('admin.allAppointments.title') || t('admin.allAppointmentsTitle') || 'Review appointments',
                  t('admin.paymentApprovals.title') || t('admin.paymentApprovalsTitle') || 'Payment approvals'
                ].map(action => (
                  <button key={action} className="w-full text-left border border-border px-4 py-3 text-xs   tracking-[0.3em] hover:bg-light-bg transition">
                    {action}
                  </button>
                ))}
              </div>
              <div className="border-t border-border pt-5">
                <p className="text-xs   tracking-[0.35em] text-muted-foreground mb-2">{t('admin.support') || 'Support'}</p>
                <p className="text-sm text-accent">team@E-ivuze.com</p>
                <p className="text-sm text-accent mt-1">+250788777888/+250 788854243</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;

