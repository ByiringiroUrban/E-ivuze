import React, { useContext } from 'react';
import { Routes, Route } from 'react-router-dom';
import { HospitalContext } from '../../context/HospitalContext';
import HospitalDoctors from './HospitalDoctors';
import HospitalPatients from './HospitalPatients';
import HospitalTransfers from './HospitalTransfers';
import HospitalReports from './HospitalReports';
import HospitalSettings from './HospitalSettings';
import HospitalDashboardMain from './HospitalDashboardMain';
import TrialExpiredBlock from '../../components/TrialExpiredBlock';

const HospitalDashboard = () => {
  const { hospital } = useContext(HospitalContext);

  // Check if trial expired and no active subscription
  const isTrialExpired = () => {
    if (!hospital?.trialEndsAt) return false;
    return new Date(hospital.trialEndsAt) < new Date();
  };

  const hasActiveSubscription = () => {
    if (!hospital?.subscriptionExpiresAt) return false;
    return new Date(hospital.subscriptionExpiresAt) > new Date();
  };

  const showBlock = isTrialExpired() && !hasActiveSubscription();

  return (
    <div className='flex-1 bg-gray-50 min-h-screen relative'>
      {showBlock && <TrialExpiredBlock />}
      <div className={showBlock ? 'pointer-events-none opacity-50' : ''}>
        <Routes>
          <Route path="/doctors" element={<HospitalDoctors />} />
          <Route path="/patients" element={<HospitalPatients />} />
          <Route path="/transfers" element={<HospitalTransfers />} />
          <Route path="/reports" element={<HospitalReports />} />
          <Route path="/settings" element={<HospitalSettings />} />
          <Route path="/" element={<HospitalDashboardMain />} />
        </Routes>
      </div>
    </div>
  );
};

export default HospitalDashboard;
