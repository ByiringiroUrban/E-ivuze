import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

export const HospitalContext = createContext();

const HospitalContextProvider = (props) => {
  const [hToken, setHToken] = useState(localStorage.getItem('hToken') ? localStorage.getItem('hToken') : '');
  const [hospital, setHospital] = useState(null);
  const [hospitalUser, setHospitalUser] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [transfers, setTransfers] = useState({ outgoing: [], incoming: [] });
  const [approvedHospitals, setApprovedHospitals] = useState([]);
  const [loading, setLoading] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

  // Register Hospital
  const registerHospital = async (hospitalData) => {
    try {
      const { data } = await axios.post(backendUrl + '/api/hospitals/register', hospitalData);
      if (data.success) {
        localStorage.setItem('hToken', data.token);
        setHToken(data.token);
        setHospital(data.hospital);
        toast.success(data.message);
        return { success: true, data };
      } else {
        toast.error(data.message);
        return { success: false, message: data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // Login Hospital
  const loginHospital = async (email, password) => {
    try {
      const { data } = await axios.post(backendUrl + '/api/hospitals/login', { email, password });
      if (data.success) {
        localStorage.setItem('hToken', data.token);
        setHToken(data.token);
        setHospital(data.hospital);
        setHospitalUser(data.user);
        toast.success('Login successful');
        return { success: true, data };
      } else {
        toast.error(data.message);
        return { success: false, message: data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // Get Hospital Details
  const getHospitalDetails = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/hospitals/details', {
        headers: { hToken }
      });
      if (data.success) {
        setHospital(data.hospital);
        return data.hospital;
      } else {
        toast.error(data.message);
        return null;
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(errorMessage);
      return null;
    }
  };

  // Get Dashboard Data (Charts)
  const getDashData = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(backendUrl + '/api/hospitals/dashboard', {
        headers: { hToken }
      });
      if (data.success) {
        return data.dashData;
      } else {
        toast.error(data.message);
        return null;
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Get Hospital Doctors
  const getHospitalDoctors = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(backendUrl + '/api/hospitals/doctors', {
        headers: { hToken }
      });
      if (data.success) {
        setDoctors(data.doctors);
        return data.doctors;
      } else {
        toast.error(data.message);
        return [];
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Create Hospital Doctor
  const createHospitalDoctor = async (doctorData) => {
    try {
      const formData = new FormData();
      Object.keys(doctorData).forEach(key => {
        if (key === 'image' && doctorData[key]) {
          formData.append('image', doctorData[key]);
        } else if (key === 'address') {
          formData.append('address', JSON.stringify(doctorData[key]));
        } else {
          formData.append(key, doctorData[key]);
        }
      });

      const { data } = await axios.post(backendUrl + '/api/hospitals/doctors', formData, {
        headers: { hToken, 'Content-Type': 'multipart/form-data' }
      });
      if (data.success) {
        toast.success(data.message);
        await getHospitalDoctors();
        return { success: true, doctor: data.doctor };
      } else {
        toast.error(data.message);
        return { success: false, message: data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // Update Hospital Doctor
  const updateHospitalDoctor = async (doctorId, doctorData) => {
    try {
      const formData = new FormData();
      Object.keys(doctorData).forEach(key => {
        if (key === 'image' && doctorData[key]) {
          formData.append('image', doctorData[key]);
        } else if (key === 'address') {
          formData.append('address', JSON.stringify(doctorData[key]));
        } else {
          formData.append(key, doctorData[key]);
        }
      });

      const { data } = await axios.put(backendUrl + `/api/hospitals/doctors/${doctorId}`, formData, {
        headers: { hToken, 'Content-Type': 'multipart/form-data' }
      });
      if (data.success) {
        toast.success(data.message);
        await getHospitalDoctors();
        return { success: true, doctor: data.doctor };
      } else {
        toast.error(data.message);
        return { success: false, message: data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // Delete Hospital Doctor
  const deleteHospitalDoctor = async (doctorId) => {
    try {
      const { data } = await axios.delete(backendUrl + `/api/hospitals/doctors/${doctorId}`, {
        headers: { hToken }
      });
      if (data.success) {
        toast.success(data.message);
        await getHospitalDoctors();
        return { success: true };
      } else {
        toast.error(data.message);
        return { success: false, message: data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // Get Hospital Patients
  const getHospitalPatients = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(backendUrl + '/api/hospitals/patients', {
        headers: { hToken }
      });
      if (data.success) {
        setPatients(data.patients);
        return data.patients;
      } else {
        toast.error(data.message);
        return [];
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Get Hospital Transfers
  const getHospitalTransfers = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(backendUrl + '/api/hospitals/transfers', {
        headers: { hToken }
      });
      if (data.success) {
        setTransfers({ outgoing: data.outgoing, incoming: data.incoming });
        return { outgoing: data.outgoing, incoming: data.incoming };
      } else {
        toast.error(data.message);
        return { outgoing: [], incoming: [] };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(errorMessage);
      return { outgoing: [], incoming: [] };
    } finally {
      setLoading(false);
    }
  };

  // Create Transfer
  const createTransfer = async (transferData) => {
    try {
      const { data } = await axios.post(backendUrl + '/api/hospitals/transfers', transferData, {
        headers: { hToken }
      });
      if (data.success) {
        toast.success(data.message);
        await getHospitalTransfers();
        return { success: true, transfer: data.transfer };
      } else {
        toast.error(data.message);
        return { success: false, message: data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // Accept Transfer
  const acceptTransfer = async (transferId, notes = '') => {
    try {
      const { data } = await axios.post(backendUrl + `/api/hospitals/transfers/${transferId}/accept`, { notes }, {
        headers: { hToken }
      });
      if (data.success) {
        toast.success(data.message);
        await getHospitalTransfers();
        await getHospitalPatients();
        return { success: true, transfer: data.transfer };
      } else {
        toast.error(data.message);
        return { success: false, message: data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // Reject Transfer
  const rejectTransfer = async (transferId, reason = '') => {
    try {
      const { data } = await axios.post(backendUrl + `/api/hospitals/transfers/${transferId}/reject`, { reason }, {
        headers: { hToken }
      });
      if (data.success) {
        toast.success(data.message);
        await getHospitalTransfers();
        return { success: true, transfer: data.transfer };
      } else {
        toast.error(data.message);
        return { success: false, message: data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // Get Approved Hospitals (for transfer target selection)
  const getApprovedHospitals = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/hospitals/approved');
      if (data.success) {
        setApprovedHospitals(data.hospitals);
        return data.hospitals;
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error fetching approved hospitals:', error);
      return [];
    }
  };

  // Create Hospital Payment Request
  const createHospitalPayment = async (paymentData) => {
    try {
      const { data } = await axios.post(backendUrl + '/api/hospitals/payment/create', paymentData, {
        headers: { hToken }
      });
      if (data.success) {
        toast.success(data.message);
        return { success: true, payment: data.payment };
      } else {
        toast.error(data.message);
        return { success: false, message: data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // Upload Hospital Payment Proof
  const uploadHospitalPaymentProof = async (paymentId, proofFile) => {
    try {
      const formData = new FormData();
      formData.append('paymentProof', proofFile);
      formData.append('paymentId', paymentId);

      const { data } = await axios.post(backendUrl + '/api/hospitals/payment/upload-proof', formData, {
        headers: { hToken, 'Content-Type': 'multipart/form-data' }
      });
      if (data.success) {
        toast.success(data.message);
        return { success: true, payment: data.payment };
      } else {
        toast.error(data.message);
        return { success: false, message: data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // Get Hospital Payments
  const getHospitalPayments = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/hospitals/payments', {
        headers: { hToken }
      });
      if (data.success) {
        return { success: true, payments: data.payments || [] };
      } else {
        return { success: false, payments: [] };
      }
    } catch (error) {
      console.error('Error fetching hospital payments:', error);
      return { success: false, payments: [] };
    }
  };

  // Logout
  const logoutHospital = () => {
    localStorage.removeItem('hToken');
    setHToken('');
    setHospital(null);
    setHospitalUser(null);
    setDoctors([]);
    setPatients([]);
    setTransfers({ outgoing: [], incoming: [] });
  };

  useEffect(() => {
    getApprovedHospitals();
  }, []);

  const value = {
    hToken,
    setHToken,
    hospital,
    setHospital,
    hospitalUser,
    setHospitalUser,
    doctors,
    patients,
    transfers,
    approvedHospitals,
    backendUrl,
    loading,
    registerHospital,
    loginHospital,
    getHospitalDetails,
    getDashData,
    getHospitalDoctors,
    createHospitalDoctor,
    updateHospitalDoctor,
    deleteHospitalDoctor,
    getHospitalPatients,
    getHospitalTransfers,
    createTransfer,
    acceptTransfer,
    rejectTransfer,
    getApprovedHospitals,
    createHospitalPayment,
    uploadHospitalPaymentProof,
    getHospitalPayments,
    logoutHospital
  };

  return (
    <HospitalContext.Provider value={value}>
      {props.children}
    </HospitalContext.Provider>
  );
};

export default HospitalContextProvider;
