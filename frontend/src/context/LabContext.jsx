import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const LabContext = createContext();

const LabContextProvider = (props) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || ' https://ivuzebackendv.vercel.app';
    const [lToken, setLToken] = useState(localStorage.getItem('lToken') ? localStorage.getItem('lToken') : '');
    const [labOrders, setLabOrders] = useState([]);
    const [labProfile, setLabProfile] = useState(null);

    const getLabOrders = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/lab/orders', { headers: { token: lToken } });
            if (data.success) {
                setLabOrders(data.orders);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const getLabProfile = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/lab/profile', { headers: { token: lToken } });
            if (data.success) {
                setLabProfile(data.lab);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const updateLabProfile = async (formData) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/lab/update-profile', formData, {
                headers: { token: lToken, 'Content-Type': 'multipart/form-data' }
            });
            if (data.success) {
                toast.success(data.message);
                setLabProfile(data.lab);
                return true;
            } else {
                toast.error(data.message);
                return false;
            }
        } catch (error) {
            toast.error(error.message);
            return false;
        }
    };

    const updateOrderStatus = async (orderId, status) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/lab/update-status', { orderId, status }, { headers: { token: lToken } });
            if (data.success) {
                toast.success(data.message);
                getLabOrders();
                return true;
            } else {
                toast.error(data.message);
                return false;
            }
        } catch (error) {
            toast.error(error.message);
            return false;
        }
    };

    const uploadResult = async (formData) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/lab/upload-result', formData, {
                headers: { token: lToken, 'Content-Type': 'multipart/form-data' }
            });
            if (data.success) {
                toast.success(data.message);
                getLabOrders();
                return true;
            } else {
                toast.error(data.message);
                return false;
            }
        } catch (error) {
            toast.error(error.message);
            return false;
        }
    }

    const value = {
        lToken, setLToken,
        backendUrl,
        labOrders, getLabOrders,
        labProfile, getLabProfile, updateLabProfile,
        updateOrderStatus,
        uploadResult
    };

    useEffect(() => {
        if (lToken) {
            getLabOrders();
            getLabProfile();
        }
    }, [lToken])

    return (
        <LabContext.Provider value={value}>
            {props.children}
        </LabContext.Provider>
    );
};

export default LabContextProvider;
