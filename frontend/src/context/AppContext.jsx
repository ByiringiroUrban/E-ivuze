import { createContext, useEffect, useState } from "react";
import axios from "axios"
import { toast } from 'react-toastify'


export const AppContext = createContext()

const AppContextProvider = (props) => {

    const currencySymbol = 'RWF'
    const backendUrl = import.meta.env.VITE_BACKEND_URL || ' https://ivuzebackendv.vercel.app'

    const [doctors, setDoctors] = useState([])
    const [token, setToken] = useState(localStorage.getItem('token') ? localStorage.getItem('token') : false)
    const [consultationFee, setConsultationFee] = useState(3000) // Default consultation fee
    const [isChristmasThemeActive, setIsChristmasThemeActive] = useState(false)

    const [userData, setUserData] = useState(false)
    const [isBusy, setIsBusy] = useState(false)
    const [pageLoading, setPageLoading] = useState(false)
    const [aiModels, setAiModels] = useState([])
    const [preferredAiModel, setPreferredAiModel] = useState(localStorage.getItem('preferredAiModel') || 'gemini-1.5-flash-latest')

    const runWithBusy = async (fn) => {
        if (isBusy) return;
        setIsBusy(true);
        try {
            return await fn();
        } finally {
            setIsBusy(false);
        }
    }

    const withPageLoader = async (fn) => {
        if (pageLoading) return;
        setPageLoading(true);
        try {
            return await fn();
        } finally {
            setPageLoading(false);
        }
    }


    const getDoctorsData = async () => {
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                },
                withCredentials: true
            };

            const { data } = await axios.get(backendUrl + '/api/doctor/list', config);

            if (data.success) {
                setDoctors(data.doctors);
            } else {
                toast.error(data.message);
            }

        } catch (error) {
            toast.error(error.response?.data?.message || error.message || 'Error fetching doctors');
        }
    }

    const getPublicSettings = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/public/settings');
            if (data.success) {
                if (data.consultationFee) setConsultationFee(data.consultationFee);
                if (data.isChristmasThemeActive !== undefined) setIsChristmasThemeActive(data.isChristmasThemeActive);
            }
        } catch (error) {
            // Keep default value
        }
    }

    const loadUserProfileData = async () => {
        try {

            const { data } = await axios.get(backendUrl + '/api/user/get-profile', { headers: { token } })

            if (data.success) {
                setUserData(data.userData)
            }
            else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message);
        }
    }

    const calculateAge = (dob) => {
        const today = new Date()
        const birthDate = new Date(dob)
        let age = today.getFullYear() - birthDate.getFullYear()
        return age
    }

    const months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    const slotDateFormat = (slotDate) => {
        const dateArray = slotDate.split('_')
        return dateArray[0] + " " + months[Number(dateArray[1])] + " " + dateArray[2]
    }

    const fetchAiModels = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/ai/models');
            if (data.success) {
                setAiModels(data.models);
            }
        } catch (error) {
            console.error('Failed to fetch AI models', error);
        }
    }

    const updatePreferredModel = (modelId) => {
        setPreferredAiModel(modelId);
        localStorage.setItem('preferredAiModel', modelId);
    }

    const value = {
        doctors,
        getDoctorsData,
        currency: currencySymbol,
        currencySymbol,
        consultationFee,
        isChristmasThemeActive,
        token, setToken,
        backendUrl,
        userData, setUserData,
        loadUserProfileData,
        calculateAge,
        slotDateFormat,
        isBusy,
        runWithBusy,
        pageLoading,
        setPageLoading,
        withPageLoader,
        aiModels,
        preferredAiModel,
        updatePreferredModel
    }


    useEffect(() => {
        getDoctorsData()
        getPublicSettings()
        fetchAiModels()
    }, [])

    useEffect(() => {
        if (token) {
            loadUserProfileData()
        }
        else {
            setUserData(false)
        }

        // Add axios interceptor to handle forced onboarding from backend
        const interceptor = axios.interceptors.response.use(
            response => {
                if (response.data && response.data.message === 'ONBOARDING_REQUIRED') {
                    // Backend says onboarding is required
                    if (userData) {
                        setUserData(prev => ({ ...prev, onboardingCompleted: false }));
                    }
                    // Redirection is handled in App.jsx via userData observation
                }
                return response;
            },
            error => Promise.reject(error)
        );

        return () => axios.interceptors.response.eject(interceptor);
    }, [token])

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}

export default AppContextProvider