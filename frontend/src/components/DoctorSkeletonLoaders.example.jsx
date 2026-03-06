// Example Usage of Doctor Skeleton Loaders
// This file demonstrates how to integrate skeleton loaders into doctor pages

import React, { useState, useEffect } from 'react';
import DoctorSkeletonLoaders from './DoctorSkeletonLoaders';

// Example 1: My Appointments Page with Skeleton Loading
const DoctorAppointmentWithSkeleton = () => {
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    // Simulate data fetching
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        // Your actual data fetching logic here
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate delay
        setAppointments([]); // Your actual data
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  // Show skeleton while loading
  if (loading) {
    return <DoctorSkeletonLoaders.AppointmentsSkeleton />;
  }

  // Show actual content when loaded
  return (
    <div className='flex-1 bg-gray-50 min-h-screen p-3 sm:p-4 lg:p-6'>
      {/* Your actual appointments content here */}
      <div className='bg-white rounded-xl shadow-sm overflow-hidden'>
        <div className='px-4 sm:px-6 py-3 sm:py-4 border-b bg-white'>
          <p className='text-lg sm:text-xl font-semibold text-gray-800'>My Appointments</p>
        </div>
        {/* Rest of your appointments content */}
      </div>
    </div>
  );
};

// Example 2: Doctor Calendar with Skeleton Loading
const DoctorCalendarWithSkeleton = () => {
  const [loading, setLoading] = useState(true);
  const [calendarData, setCalendarData] = useState({});

  useEffect(() => {
    const fetchCalendarData = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        setCalendarData({}); // Your actual calendar data
      } catch (error) {
        console.error('Error fetching calendar:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCalendarData();
  }, []);

  if (loading) {
    return <DoctorSkeletonLoaders.CalendarSkeleton />;
  }

  return (
    <div className='flex-1 bg-gray-50 min-h-screen p-3 sm:p-4 lg:p-6'>
      {/* Your actual calendar content here */}
    </div>
  );
};

// Example 3: Doctor Profile with Skeleton Loading
const DoctorProfileWithSkeleton = () => {
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({});

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setProfileData({}); // Your actual profile data
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  if (loading) {
    return <DoctorSkeletonLoaders.ProfileSkeleton />;
  }

  return (
    <div className='flex-1 bg-gray-50 min-h-screen p-3 sm:p-4 lg:p-6'>
      {/* Your actual profile content here */}
    </div>
  );
};

// Example 4: Prescriptions Page with Skeleton Loading
const DoctorPrescriptionsWithSkeleton = () => {
  const [loading, setLoading] = useState(true);
  const [prescriptions, setPrescriptions] = useState([]);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1800));
        setPrescriptions([]); // Your actual prescriptions data
      } catch (error) {
        console.error('Error fetching prescriptions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrescriptions();
  }, []);

  if (loading) {
    return <DoctorSkeletonLoaders.PrescriptionsSkeleton />;
  }

  return (
    <div className='flex-1 bg-gray-50 min-h-screen p-3 sm:p-4 lg:p-6'>
      {/* Your actual prescriptions content here */}
    </div>
  );
};

// Example 5: Medical Records with Skeleton Loading
const DoctorRecordsWithSkeleton = () => {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        setRecords([]); // Your actual records data
      } catch (error) {
        console.error('Error fetching records:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, []);

  if (loading) {
    return <DoctorSkeletonLoaders.RecordsSkeleton />;
  }

  return (
    <div className='flex-1 bg-gray-50 min-h-screen p-3 sm:p-4 lg:p-6'>
      {/* Your actual records content here */}
    </div>
  );
};

// Example 6: Patients List with Skeleton Loading
const DoctorPatientsWithSkeleton = () => {
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1600));
        setPatients([]); // Your actual patients data
      } catch (error) {
        console.error('Error fetching patients:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  if (loading) {
    return <DoctorSkeletonLoaders.PatientsSkeleton />;
  }

  return (
    <div className='flex-1 bg-gray-50 min-h-screen p-3 sm:p-4 lg:p-6'>
      {/* Your actual patients content here */}
    </div>
  );
};

// Example 7: Lab Results with Skeleton Loading
const DoctorLabResultsWithSkeleton = () => {
  const [loading, setLoading] = useState(true);
  const [labResults, setLabResults] = useState([]);

  useEffect(() => {
    const fetchLabResults = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1700));
        setLabResults([]); // Your actual lab results data
      } catch (error) {
        console.error('Error fetching lab results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLabResults();
  }, []);

  if (loading) {
    return <DoctorSkeletonLoaders.LabResultsSkeleton />;
  }

  return (
    <div className='flex-1 bg-gray-50 min-h-screen p-3 sm:p-4 lg:p-6'>
      {/* Your actual lab results content here */}
    </div>
  );
};

// Example 8: Reports with Skeleton Loading
const DoctorReportsWithSkeleton = () => {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState({});

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 2200));
        setReports({}); // Your actual reports data
      } catch (error) {
        console.error('Error fetching reports:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) {
    return <DoctorSkeletonLoaders.ReportsSkeleton />;
  }

  return (
    <div className='flex-1 bg-gray-50 min-h-screen p-3 sm:p-4 lg:p-6'>
      {/* Your actual reports content here */}
    </div>
  );
};

// Utility Hook for Skeleton Loading
const useSkeletonLoader = (fetchFunction, dependencies = []) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchFunction();
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, dependencies);

  return { loading, data, error };
};

// Example using the custom hook
const DoctorPageWithHook = () => {
  const { loading, data, error } = useSkeletonLoader(
    async () => {
      // Your data fetching logic
      await new Promise(resolve => setTimeout(resolve, 1500));
      return { appointments: [] };
    },
    []
  );

  if (loading) {
    return <DoctorSkeletonLoaders.AppointmentsSkeleton />;
  }

  if (error) {
    return <div>Error loading data: {error.message}</div>;
  }

  return (
    <div className='flex-1 bg-gray-50 min-h-screen p-3 sm:p-4 lg:p-6'>
      {/* Your content here */}
    </div>
  );
};

export {
  DoctorAppointmentWithSkeleton,
  DoctorCalendarWithSkeleton,
  DoctorProfileWithSkeleton,
  DoctorPrescriptionsWithSkeleton,
  DoctorRecordsWithSkeleton,
  DoctorPatientsWithSkeleton,
  DoctorLabResultsWithSkeleton,
  DoctorReportsWithSkeleton,
  DoctorPageWithHook,
  useSkeletonLoader
};
