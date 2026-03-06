import { useState } from "react";
import { createContext } from "react";
import axios from 'axios'
import { toast } from 'react-toastify'

export const DoctorContext = createContext()

const DoctorContextProvider = (props) => {

    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'

    const [dToken, setDToken] = useState(localStorage.getItem('dToken') ? localStorage.getItem('dToken') : '')
    const [appointments, setAppointments] = useState([])
    const [dashData, setDashData] = useState(false)
    const [profileData, setProfileData] = useState(false)

    const getAppointments = async () => {
        try {

            const { data } = await axios.get(backendUrl + '/api/doctor/appointments', { headers: { dToken } })
            if (data.success) {
                setAppointments(data.appointments)
                console.log(data.appointments);

            } else {
                toast.error(data.message)
            }

        } catch (error) {
            console.log(error);
            toast.error(error.message)

        }
    }

    const completeAppointment = async (appointmentId) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/doctor/complete-appointment', { appointmentId }, { headers: { dToken } })
            if (data.success) {
                toast.success(data.message || 'Appointment completed successfully')
                getAppointments()
            }
            else {
                toast.error(data.message || 'Failed to complete appointment')
            }
        } catch (error) {
            console.error('Error completing appointment:', error);
            toast.error(error.response?.data?.message || error.message || 'Failed to complete appointment')
        }
    }


    const cancelAppointment = async (appointmentId) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/doctor/cancel-appointment', { appointmentId }, { headers: { dToken } })
            if (data.success) {
                toast.success(data.message || 'Appointment cancelled successfully')
                getAppointments()
            }
            else {
                toast.error(data.message || 'Failed to cancel appointment')
            }
        } catch (error) {
            console.error('Error cancelling appointment:', error);
            toast.error(error.response?.data?.message || error.message || 'Failed to cancel appointment')
        }
    }

    const approveAppointment = async (appointmentId, setApproving) => {
        try {
            if (setApproving) setApproving(appointmentId);
            const { data } = await axios.post(backendUrl + '/api/doctor/approve-appointment', { appointmentId }, { headers: { dToken } })
            if (data.success) {
                toast.success(data.message || 'Appointment approved successfully')
                getAppointments()
            }
            else {
                toast.error(data.message || 'Failed to approve appointment')
            }
        } catch (error) {
            console.error('Error approving appointment:', error);
            toast.error(error.response?.data?.message || error.message || 'Failed to approve appointment')
        } finally {
            if (setApproving) setApproving(null);
        }
    }

    const rejectAppointment = async (appointmentId, rejectionMessage) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/doctor/reject-appointment', { appointmentId, rejectionMessage }, { headers: { dToken } })
            if (data.success) {
                toast.success(data.message || 'Appointment rejected successfully')
                getAppointments()
            }
            else {
                toast.error(data.message || 'Failed to reject appointment')
            }
        } catch (error) {
            console.error('Error rejecting appointment:', error);
            toast.error(error.response?.data?.message || error.message || 'Failed to reject appointment')
        }
    }

    const getDashData = async () => {
        try {

            const { data } = await axios.get(backendUrl + '/api/doctor/dashboard', { headers: { dToken } })

            if (data.success) {
                setDashData(data.dashData)
                console.log(data.dashData)
            }
            else {
                toast.error(data.message)
            }

        } catch (error) {
            console.log(error);
            toast.error(error.message)
        }
    }

    const getProfileData = async () => {
        try {

            const { data } = await axios.get(backendUrl + '/api/doctor/profile', { headers: { dToken } })
            if (data.success) {
                setProfileData(data.profileData)
                console.log(data.profileData)
            }

        } catch (error) {
            console.log(error);
            toast.error(error.message)
        }
    }

    const notifyPatientLab = async (orderId) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/clinical/doctor/notify-patient-lab', { orderId }, { headers: { dToken } })
            if (data.success) {
                toast.success(data.message)
                return true;
            } else {
                toast.error(data.message)
                return false;
            }
        } catch (error) {
            toast.error(error.message)
            return false;
        }
    }


    const value = {

        dToken, setDToken,
        backendUrl, appointments,
        setAppointments, getAppointments,
        completeAppointment, cancelAppointment,
        approveAppointment, rejectAppointment,
        dashData, setDashData, getDashData,
        profileData, setProfileData,
        getProfileData, notifyPatientLab

    }

    return (
        <DoctorContext.Provider value={value}>
            {props.children}
        </DoctorContext.Provider>
    )
}

export default DoctorContextProvider

