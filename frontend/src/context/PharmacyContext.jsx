import axios from "axios";
import { createContext, useState } from "react";
import { toast } from "react-toastify";

export const PharmacyContext = createContext();

const PharmacyContextProvider = (props) => {
  const [pToken, setPToken] = useState(localStorage.getItem('pToken') ? localStorage.getItem('pToken') : '');
  const [pharmacy, setPharmacy] = useState(null);
  const [pharmacyUser, setPharmacyUser] = useState(null);
  const [medications, setMedications] = useState([]);
  const [orders, setOrders] = useState([]);
  const [dashboard, setDashboard] = useState(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

  // Accept invitation
  const acceptInvitation = async (invitationData) => {
    try {
      const { data } = await axios.post(backendUrl + '/api/pharmacy/invite/accept', invitationData);
      if (data.success) {
        localStorage.setItem('pToken', data.token);
        setPToken(data.token);
        setPharmacyUser(data.user);
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

  // Login Pharmacy
  const loginPharmacy = async (email, password) => {
    try {
      const { data } = await axios.post(backendUrl + '/api/pharmacy/login', { email, password });
      if (data.success) {
        localStorage.setItem('pToken', data.token);
        setPToken(data.token);
        setPharmacyUser(data.user);
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

  // Get Dashboard
  const getDashboard = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/pharmacy/dashboard', {
        headers: { token: pToken }
      });
      if (data.success) {
        setDashboard(data.dashboard);
        return data.dashboard;
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

  // Get Profile
  const getProfile = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/pharmacy/profile', {
        headers: { token: pToken }
      });
      if (data.success) {
        setPharmacy(data.pharmacy);
        return data.pharmacy;
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

  // Get Medications
  const getMedications = async (filters = {}) => {
    try {
      const { data } = await axios.get(backendUrl + '/api/pharmacy/medications', {
        headers: { token: pToken },
        params: filters
      });
      if (data.success) {
        setMedications(data.medications);
        return data.medications;
      } else {
        toast.error(data.message);
        return [];
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(errorMessage);
      return [];
    }
  };

  // Create Medication
  const createMedication = async (medicationData) => {
    try {
      const { data } = await axios.post(backendUrl + '/api/pharmacy/medications', medicationData, {
        headers: { token: pToken }
      });
      if (data.success) {
        toast.success(data.message);
        await getMedications();
        return { success: true, medication: data.medication };
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

  // Update Medication
  const updateMedication = async (medicationId, medicationData) => {
    try {
      const { data } = await axios.put(backendUrl + `/api/pharmacy/medications/${medicationId}`, medicationData, {
        headers: { token: pToken }
      });
      if (data.success) {
        toast.success(data.message);
        await getMedications();
        return { success: true, medication: data.medication };
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

  // Delete Medication
  const deleteMedication = async (medicationId) => {
    try {
      const { data } = await axios.delete(backendUrl + `/api/pharmacy/medications/${medicationId}`, {
        headers: { token: pToken }
      });
      if (data.success) {
        toast.success(data.message);
        await getMedications();
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

  // Bulk Upload Medications
  const bulkUploadMedications = async (medications) => {
    try {
      const { data } = await axios.post(backendUrl + '/api/pharmacy/medications/bulk-upload', { medications }, {
        headers: { token: pToken }
      });
      if (data.success) {
        toast.success(data.message);
        await getMedications();
        return { success: true, results: data.results };
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

  // Get Orders
  const getOrders = async (filters = {}) => {
    try {
      const { data } = await axios.get(backendUrl + '/api/pharmacy/orders', {
        headers: { token: pToken },
        params: filters
      });
      if (data.success) {
        setOrders(data.orders);
        return data.orders;
      } else {
        toast.error(data.message);
        return [];
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(errorMessage);
      return [];
    }
  };

  // Update Order Status
  const updateOrderStatus = async (orderId, status, courier = null, note = '') => {
    try {
      const { data } = await axios.put(backendUrl + `/api/pharmacy/orders/${orderId}/status`, {
        status,
        courier,
        note
      }, {
        headers: { token: pToken }
      });
      if (data.success) {
        toast.success(data.message);
        await getOrders();
        await getDashboard();
        return { success: true, order: data.order };
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

  // Add Order Message
  const addOrderMessage = async (orderId, text) => {
    try {
      const { data } = await axios.post(backendUrl + `/api/pharmacy/orders/${orderId}/messages`, { text }, {
        headers: { token: pToken }
      });
      if (data.success) {
        toast.success(data.message);
        await getOrders();
        return { success: true, order: data.order };
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

  // Get Reports
  const getReports = async (startDate = null, endDate = null) => {
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const { data } = await axios.get(backendUrl + '/api/pharmacy/reports', {
        headers: { token: pToken },
        params
      });
      if (data.success) {
        return data.reports;
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

  // Logout
  const logoutPharmacy = () => {
    localStorage.removeItem('pToken');
    setPToken('');
    setPharmacy(null);
    setPharmacyUser(null);
    setMedications([]);
    setOrders([]);
    setDashboard(null);
  };

  const value = {
    pToken,
    setPToken,
    pharmacy,
    setPharmacy,
    pharmacyUser,
    setPharmacyUser,
    medications,
    orders,
    dashboard,
    backendUrl,
    acceptInvitation,
    loginPharmacy,
    getDashboard,
    getProfile,
    getMedications,
    createMedication,
    updateMedication,
    deleteMedication,
    bulkUploadMedications,
    getOrders,
    updateOrderStatus,
    addOrderMessage,
    getReports,
    logoutPharmacy
  };

  return (
    <PharmacyContext.Provider value={value}>
      {props.children}
    </PharmacyContext.Provider>
  );
};

export default PharmacyContextProvider;

