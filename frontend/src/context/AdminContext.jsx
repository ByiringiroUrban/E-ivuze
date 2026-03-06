import axios from "axios";
import { createContext, useState } from "react";
import { toast } from "react-toastify";

export const AdminContext = createContext()

const AdminContextProvider = (props) => {


    const [aToken, setAToken] = useState(localStorage.getItem('aToken') ? localStorage.getItem('aToken') : '')
    const [doctors, setDoctors] = useState([])
    const [appointments, setAppointments] = useState([])
    const [dashData, setDashData] = useState(false)
    const [loading, setLoading] = useState(false)

    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'


    const getAllDoctors = async () => {
        try {
            setLoading(true)
            const { data } = await axios.post(backendUrl + '/api/admin/all-doctor', {}, { headers: { aToken } })

            if (data.success) {
                setDoctors(data.doctors || [])
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message)
        } finally {
            setLoading(false)
        }
    }

    const changeAvailbility = async (docId) => {
        try {
            const { data } = await axios.post(backendUrl + "/api/admin/change-availbility", { docId }, { headers: { aToken } })
            if (data.success) {
                toast.success(data.message)
                getAllDoctors()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }


    const getAllAppointments = async () => {
        try {
            setLoading(true)
            const { data } = await axios.get(backendUrl + '/api/admin/appointments', { headers: { aToken } })

            if (data.success) {
                setAppointments(data.appointments)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    const cancelAppointment = async (appointmentId) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/admin/cancel-appointment', { appointmentId }, { headers: { aToken } })
            if (data.success) {
                toast.success(data.message)
                getAllAppointments()
            }
            else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const getDashData = async () => {
        try {
            setLoading(true)
            const { data } = await axios.get(backendUrl + '/api/admin/dashboard', { headers: { aToken } })

            if (data.success) {
                setDashData(data.dashData)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.error('Dashboard error:', error);
            toast.error(error.response?.data?.message || error.message || 'Failed to fetch dashboard data')
        } finally {
            setLoading(false)
        }
    }

    // Register Hospital by Admin (Auto-approved)
    const registerHospitalByAdmin = async (hospitalData) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/admin/hospitals/register', hospitalData, {
                headers: { aToken }
            });
            if (data.success) {
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

    const value = {
        aToken, setAToken,
        backendUrl, doctors,
        getAllDoctors,
        changeAvailbility,
        appointments, setAppointments,
        getAllAppointments,
        cancelAppointment, dashData,
        getDashData,
        registerHospitalByAdmin,
        loading
    }

    return (
        <AdminContext.Provider value={value}>
            {props.children}
        </AdminContext.Provider>
    )
}

export default AdminContextProvider

