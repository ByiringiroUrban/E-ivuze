import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { LoadingComponents } from '../components/LoadingComponents';
import SEO from '../components/SEO';
import { FaCheck } from 'react-icons/fa';

const RWANDA_ADMIN = {
    "Kigali City": ["Gasabo", "Kicukiro", "Nyarugenge"],
    "Northern Province": ["Burera", "Gakenke", "Gicumbi", "Musanze", "Rulindo"],
    "Southern Province": ["Gisagara", "Huye", "Kamonyi", "Muhanga", "Nyamagabe", "Nyanza", "Nyaruguru", "Ruhango"],
    "Eastern Province": ["Bugesera", "Gatsibo", "Kayonza", "Kirehe", "Ngoma", "Nyagatare", "Rwamagana"],
    "Western Province": ["Karongi", "Ngororero", "Nyabihu", "Nyamasheke", "Rubavu", "Rusizi", "Rutsiro"]
};

const Onboarding = () => {
    const { token, userData, loadUserProfileData, backendUrl } = useContext(AppContext);
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(true);
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        middleName: '',
        phone: '',
        dob: '',
        gender: '',
        nid: '',
        address: {
            line1: '',
            province: '',
            district: '',
            sector: '',
            cell: ''
        },
        bloodGroup: '',
        weight: '',
        height: '',
        insurance: {
            provider: 'None',
            policyNumber: ''
        },
        emergencyContact: {
            name: '',
            phone: ''
        },
        digitalConsent: false
    });

    useEffect(() => {
        if (userData) {
            setFormData(prev => ({
                ...prev,
                firstName: userData.name?.split(' ')[0] || prev.firstName,
                lastName: userData.name?.split(' ').slice(1).join(' ') || prev.lastName,
                phone: userData.phone || prev.phone
            }));
            setChecking(false);
        }

        const timeout = setTimeout(() => {
            setChecking(false);
        }, 2500);

        return () => clearTimeout(timeout);
    }, [userData]);

    const validateField = (name, value, nested = null) => {
        let error = '';
        if (nested) {
            if (!value || String(value).trim() === '') {
                error = 'This field is required';
            }
        } else {
            if (name === 'nid') {
                if (!value || value.trim().length !== 16) {
                    error = 'National ID must be exactly 16 digits';
                }
            } else if (name === 'digitalConsent') {
                if (!value) {
                    error = 'Consent is mandatory';
                }
            } else if (name === 'bloodGroup' || name === 'weight' || name === 'height') {
                // Allow values but flag if completely empty and not '0' (which means I don't know)
                if (value === '' || value === undefined || value === null) {
                    error = 'This field is required';
                }
            } else if (!value || (typeof value === 'string' && value.trim() === '')) {
                error = 'This field is required';
            }
        }
        return error;
    };

    const handleNext = () => {
        const stepErrors = {};
        if (step === 1) {
            stepErrors.firstName = validateField('firstName', formData.firstName);
            stepErrors.lastName = validateField('lastName', formData.lastName);
            stepErrors.nid = validateField('nid', formData.nid);
            stepErrors.dob = validateField('dob', formData.dob);
            stepErrors.gender = validateField('gender', formData.gender);
            stepErrors.phone = validateField('phone', formData.phone);
        } else if (step === 2) {
            stepErrors['address.province'] = validateField('province', formData.address.province, 'address');
            stepErrors['address.district'] = validateField('district', formData.address.district, 'address');
            stepErrors['address.sector'] = validateField('sector', formData.address.sector, 'address');
            stepErrors['address.cell'] = validateField('cell', formData.address.cell, 'address');
        } else if (step === 3) {
            stepErrors.bloodGroup = validateField('bloodGroup', formData.bloodGroup);
            stepErrors.weight = validateField('weight', formData.weight);
            stepErrors.height = validateField('height', formData.height);
        }

        const hasErrors = Object.values(stepErrors).some(err => err !== '');
        setErrors(stepErrors);

        if (!hasErrors) {
            setStep(prev => prev + 1);
            setErrors({});
            window.scrollTo(0, 0);
        }
    };

    const handleBack = () => {
        setStep(prev => prev - 1);
        setErrors({});
    };

    const handleInputChange = (e, field, nested = null) => {
        const { value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;

        if (nested) {
            setFormData(prev => ({ ...prev, [nested]: { ...prev[nested], [field]: val } }));
            // Clear error on change if it exists
            const errorKey = `${nested}.${field}`;
            if (errors[errorKey]) {
                setErrors(prev => ({ ...prev, [errorKey]: validateField(field, val, nested) }));
            }
        } else {
            setFormData(prev => ({ ...prev, [field]: val }));
            // Clear error on change if it exists
            if (errors[field]) {
                setErrors(prev => ({ ...prev, [field]: validateField(field, val) }));
            }
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        const stepErrors = {
            'emergencyContact.name': validateField('name', formData.emergencyContact.name, 'emergencyContact'),
            'emergencyContact.phone': validateField('phone', formData.emergencyContact.phone, 'emergencyContact'),
            digitalConsent: validateField('digitalConsent', formData.digitalConsent)
        };

        const hasErrors = Object.values(stepErrors).some(err => err !== '');
        setErrors(stepErrors);

        if (hasErrors) return;

        setLoading(true);
        try {
            const data = {
                userId: userData._id,
                ...formData,
                onboardingCompleted: true
            };

            const response = await axios.post(backendUrl + '/api/user/complete-onboarding', data, { headers: { token } });
            if (response.data.success) {
                toast.success("Profile Activated.");
                await loadUserProfileData();
                navigate('/');
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (token && checking && !userData) return <LoadingComponents.PageLoader />;

    const steps_config = [
        { id: 1, label: 'Personal Information', desc: 'Provide your legal identification details.' },
        { id: 2, label: 'Address & Location', desc: 'Specify your current residential location.' },
        { id: 3, label: 'Health Information', desc: 'Shared basic biometric data for your medical records.' },
        { id: 4, label: 'Consent & Emergency', desc: 'Finalize your profile with emergency contacts and data consent.' }
    ];

    const InputError = ({ msg }) => msg ? <p className="text-[10px] text-red-500 mt-1 font-medium">{msg}</p> : null;

    return (
        <div className="min-h-screen bg-white font-outfit text-[#006838]">
            <SEO title="Onboarding | E-ivuze" />

            {/* Header Section with Pattern */}
            <div className="relative bg-[#006838] py-20 overflow-hidden">
                <div
                    className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{ backgroundImage: 'url(/topographic-pattern.png)', backgroundSize: 'cover' }}
                />
                <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
                    <div className="w-16 h-1 bg-[#88C250] mx-auto mb-8"></div>
                    <h1 className="text-4xl lg:text-5xl font-bold text-white font-merriweather leading-tight">
                        Complete Your Profile
                    </h1>
                    <p className="text-[#88C250]/80 mt-4 font-bold text-sm">
                        Finish setting up your secure E-ivuze health profile
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto py-16 px-6">
                {userData.onboardingCompleted ? (
                    <div className="bg-white border-2 border-gray-100 p-16 text-center space-y-8 animate-in fade-in zoom-in duration-700">
                        <div className="w-20 h-20 bg-[#88C250]/10 text-[#006838] rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-[#88C250]">
                            <FaCheck className="text-3xl" />
                        </div>
                        <h2 className="text-3xl font-bold text-[#006838] font-merriweather">Profile Integration Complete</h2>
                        <p className="text-[#006838]/60 max-w-md mx-auto font-medium">
                            Your biometric and administrative data has been successfully synchronized with the E-ivuze healthcare protocol.
                        </p>
                        <div className="pt-6">
                            <button
                                onClick={() => navigate('/my-profile')}
                                className="bg-[#006838] hover:bg-[#005a30] text-white px-12 py-4 text-xs font-bold   tracking-widest transition-all active:scale-[0.98]"
                            >
                                Access Clinical Dashboard
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-[250px_1fr] gap-12">
                        {/* Stepper Logic Column */}
                        <div className="space-y-8">
                            {steps_config.map((s, idx) => {
                                const isActive = step === s.id;
                                const isCompleted = step > s.id;

                                return (
                                    <div key={s.id} className="relative flex items-start gap-4">
                                        <div className={`w-10 h-10 flex items-center justify-center text-xs font-bold border-2 transition-all duration-500 shrink-0 ${isActive ? 'bg-[#88C250] border-[#88C250] text-[#006838]' :
                                            isCompleted ? 'bg-[#006838] border-[#006838] text-white' :
                                                'bg-transparent border-gray-100 text-gray-300'
                                            }`}>
                                            {isCompleted ? <FaCheck /> : s.id}
                                        </div>
                                        <div className="pt-1">
                                            <p className={`text-[10px] font-bold ${isActive ? 'text-[#88C250]' : isCompleted ? 'text-[#006838]' : 'text-gray-300'}`}>
                                                Step 0{s.id}
                                            </p>
                                            <h3 className={`text-sm font-bold transition-colors ${isActive || isCompleted ? 'text-[#006838]' : 'text-gray-300'}`}>
                                                {s.label}
                                            </h3>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Content Area */}
                        <div className="animate-in fade-in slide-in-from-right-8 duration-700">
                            <div className="mb-10">
                                <h3 className="text-2xl font-bold text-[#006838] font-merriweather mb-2">
                                    {steps_config[step - 1].label}
                                </h3>
                                <p className="text-[#006838]/50 text-sm font-medium">
                                    {steps_config[step - 1].desc}
                                </p>
                            </div>

                            <div className="bg-white border-2 border-gray-100 p-10 space-y-10">
                                {step === 1 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-[#006838]/60   tracking-wider">First Name</label>
                                            <input required type="text" value={formData.firstName} onChange={(e) => handleInputChange(e, 'firstName')} className={`w-full border-2 ${errors.firstName ? 'border-red-500' : 'border-gray-100'} px-5 py-4 text-sm outline-none focus:border-[#88C250] transition-all bg-white text-[#006838] font-semibold`} placeholder="First Name" />
                                            <InputError msg={errors.firstName} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-[#006838]/60   tracking-wider">Last Name</label>
                                            <input required type="text" value={formData.lastName} onChange={(e) => handleInputChange(e, 'lastName')} className={`w-full border-2 ${errors.lastName ? 'border-red-500' : 'border-gray-100'} px-5 py-4 text-sm outline-none focus:border-[#88C250] transition-all bg-white text-[#006838] font-semibold`} placeholder="Last Name" />
                                            <InputError msg={errors.lastName} />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-xs font-semibold text-[#006838]/60   tracking-wider">National ID Number (NID)</label>
                                            <input required type="text" maxLength={16} value={formData.nid} onChange={(e) => handleInputChange(e, 'nid')} className={`w-full border-2 ${errors.nid ? 'border-red-500' : 'border-gray-100'} px-5 py-4 text-sm outline-none focus:border-[#88C250] transition-all font-semibold text-[#006838] placeholder:font-normal`} placeholder="16 Digit Identity Number" />
                                            <InputError msg={errors.nid} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-[#006838]/60   tracking-wider">Date of Birth</label>
                                            <input required type="date" value={formData.dob} onChange={(e) => handleInputChange(e, 'dob')} className={`w-full border-2 ${errors.dob ? 'border-red-500' : 'border-gray-100'} px-5 py-4 text-sm outline-none focus:border-[#88C250] text-[#006838] font-semibold`} />
                                            <InputError msg={errors.dob} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-[#006838]/60   tracking-wider">Gender</label>
                                            <select value={formData.gender} onChange={(e) => handleInputChange(e, 'gender')} className={`w-full border-2 ${errors.gender ? 'border-red-500' : 'border-gray-100'} px-5 py-4 text-sm outline-none bg-white focus:border-[#88C250] text-[#006838] font-semibold`}>
                                                <option value="">Select Gender</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                            </select>
                                            <InputError msg={errors.gender} />
                                        </div>
                                    </div>
                                )}

                                {step === 2 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-[#006838]/60   tracking-wider">Province</label>
                                            <select value={formData.address.province} onChange={(e) => handleInputChange(e, 'province', 'address')} className={`w-full border-2 ${errors['address.province'] ? 'border-red-500' : 'border-gray-100'} px-5 py-4 text-sm outline-none bg-white focus:border-[#88C250] text-[#006838] font-semibold`}>
                                                <option value="">Select Province</option>
                                                {Object.keys(RWANDA_ADMIN).map(p => <option key={p} value={p}>{p}</option>)}
                                            </select>
                                            <InputError msg={errors['address.province']} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-[#006838]/60   tracking-wider">District</label>
                                            <select value={formData.address.district} onChange={(e) => handleInputChange(e, 'district', 'address')} className={`w-full border-2 ${errors['address.district'] ? 'border-red-500' : 'border-gray-100'} px-5 py-4 text-sm outline-none bg-white focus:border-[#88C250] text-[#006838] font-semibold`}>
                                                <option value="">Select District</option>
                                                {formData.address.province && RWANDA_ADMIN[formData.address.province].map(d => <option key={d} value={d}>{d}</option>)}
                                            </select>
                                            <InputError msg={errors['address.district']} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-[#006838]/60   tracking-wider">Sector</label>
                                            <input required type="text" placeholder="Sector Name" value={formData.address.sector} onChange={(e) => handleInputChange(e, 'sector', 'address')} className={`w-full border-2 ${errors['address.sector'] ? 'border-red-500' : 'border-gray-100'} px-5 py-4 text-sm outline-none focus:border-[#88C250] text-[#006838] font-semibold`} />
                                            <InputError msg={errors['address.sector']} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-[#006838]/60   tracking-wider">Cell / Village</label>
                                            <input required type="text" placeholder="Village / Cell" value={formData.address.cell} onChange={(e) => handleInputChange(e, 'cell', 'address')} className={`w-full border-2 ${errors['address.cell'] ? 'border-red-500' : 'border-gray-100'} px-5 py-4 text-sm outline-none focus:border-[#88C250] text-[#006838] font-semibold`} />
                                            <InputError msg={errors['address.cell']} />
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-xs font-semibold text-[#006838]/60   tracking-wider">Street Address / Plot Number</label>
                                            <input type="text" placeholder="e.g. KN 2 Ave, House Reference" value={formData.address.line1} onChange={(e) => handleInputChange(e, 'line1', 'address')} className={`w-full border-2 border-gray-100 px-5 py-4 text-sm outline-none focus:border-[#88C250] text-[#006838] font-semibold`} />
                                        </div>
                                    </div>
                                )}

                                {step === 3 && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-[#006838]/60   tracking-wider">Blood Group</label>
                                            <select value={formData.bloodGroup} onChange={(e) => handleInputChange(e, 'bloodGroup')} className={`w-full border-2 ${errors.bloodGroup ? 'border-red-500' : 'border-gray-100'} px-5 py-4 text-sm outline-none bg-white focus:border-[#88C250] text-[#006838] font-semibold`}>
                                                <option value="">Select Type</option>
                                                <option value="Unknown">I don't know</option>
                                                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                                            </select>
                                            <InputError msg={errors.bloodGroup} />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center mb-1">
                                                <label className="text-xs font-semibold text-[#006838]/60   tracking-wider">Weight (kg)</label>
                                                <input type="checkbox" checked={formData.weight === '0' || formData.weight === 0} onChange={(e) => handleInputChange({ target: { value: e.target.checked ? '0' : '', type: 'text' } }, 'weight')} className="w-4 h-4 accent-[#88C250]" />
                                            </div>
                                            <input required type="number" disabled={formData.weight === '0' || formData.weight === 0} placeholder={formData.weight === '0' ? "N/A" : "kg"} value={formData.weight === '0' ? "" : formData.weight} onChange={(e) => handleInputChange(e, 'weight')} className={`w-full border-2 ${errors.weight ? 'border-red-500' : 'border-gray-100'} px-5 py-4 text-sm outline-none focus:border-[#88C250] disabled:opacity-30 text-[#006838] font-semibold`} />
                                            <InputError msg={errors.weight} />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center mb-1">
                                                <label className="text-xs font-semibold text-[#006838]/60   tracking-wider">Height (cm)</label>
                                                <input type="checkbox" checked={formData.height === '0' || formData.height === 0} onChange={(e) => handleInputChange({ target: { value: e.target.checked ? '0' : '', type: 'text' } }, 'height')} className="w-4 h-4 accent-[#88C250]" />
                                            </div>
                                            <input required type="number" disabled={formData.height === '0' || formData.height === 0} placeholder={formData.height === '0' ? "N/A" : "cm"} value={formData.height === '0' ? "" : formData.height} onChange={(e) => handleInputChange(e, 'height')} className={`w-full border-2 ${errors.height ? 'border-red-500' : 'border-gray-100'} px-5 py-4 text-sm outline-none focus:border-[#88C250] disabled:opacity-30 text-[#006838] font-semibold`} />
                                            <InputError msg={errors.height} />
                                        </div>

                                        <div className="md:col-span-1 space-y-2">
                                            <label className="text-xs font-semibold text-[#006838]/60   tracking-wider">Insurance Provider</label>
                                            <select value={formData.insurance.provider} onChange={(e) => handleInputChange(e, 'provider', 'insurance')} className={`w-full border-2 border-gray-100 px-5 py-4 text-sm outline-none bg-white focus:border-[#88C250] text-[#006838] font-semibold`}>
                                                <option value="None">Direct Pay / Cash</option>
                                                <option value="Mutuelle">Mutuelle (RSSB)</option>
                                                <option value="RAMA">RAMA (RSSB)</option>
                                                <option value="MMI">MMI (Military)</option>
                                                <option value="Private">Private / International</option>
                                            </select>
                                        </div>
                                        {formData.insurance.provider !== 'None' && (
                                            <div className="md:col-span-2 space-y-2 animate-in slide-in-from-right-4 duration-500">
                                                <label className="text-xs font-semibold text-[#006838]/60   tracking-wider">Policy Number</label>
                                                <input type="text" placeholder="ID / Policy Reference" value={formData.insurance.policyNumber} onChange={(e) => handleInputChange(e, 'policyNumber', 'insurance')} className="w-full border-2 border-gray-100 px-5 py-4 text-sm outline-none focus:border-[#88C250] text-[#006838] font-semibold" />
                                            </div>
                                        )}
                                    </div>
                                )}

                                {step === 4 && (
                                    <div className="space-y-10">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold text-[#006838]/60   tracking-wider">Emergency Contact Name</label>
                                                <input required type="text" value={formData.emergencyContact.name} onChange={(e) => handleInputChange(e, 'name', 'emergencyContact')} className={`w-full border-2 ${errors['emergencyContact.name'] ? 'border-red-500' : 'border-gray-100'} px-5 py-4 text-sm outline-none focus:border-[#88C250] text-[#006838] font-semibold`} placeholder="Full Name" />
                                                <InputError msg={errors['emergencyContact.name']} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold text-[#006838]/60   tracking-wider">Emergency Phone Number</label>
                                                <input required type="tel" value={formData.emergencyContact.phone} onChange={(e) => handleInputChange(e, 'phone', 'emergencyContact')} className={`w-full border-2 ${errors['emergencyContact.phone'] ? 'border-red-500' : 'border-gray-100'} px-5 py-4 text-sm outline-none focus:border-[#88C250] text-[#006838] font-semibold`} placeholder="Phone Number" />
                                                <InputError msg={errors['emergencyContact.phone']} />
                                            </div>
                                        </div>

                                        <div
                                            className={`p-6 border-2 transition-all cursor-pointer ${formData.digitalConsent ? 'bg-[#88C250]/10 border-[#88C250]' : errors.digitalConsent ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-100'}`}
                                            onClick={() => handleInputChange({ target: { checked: !formData.digitalConsent, type: 'checkbox' } }, 'digitalConsent')}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className={`w-6 h-6 border-2 shrink-0 flex items-center justify-center transition-all ${formData.digitalConsent ? 'bg-[#006838] border-[#006838] text-white' : 'border-[#006838]/20 bg-white'}`}>
                                                    {formData.digitalConsent && <FaCheck className="text-[10px]" />}
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-xs font-bold   tracking-widest text-[#006838]">Digital Consent Protocol</p>
                                                    <p className="text-[11px] text-[#006838]/60 leading-relaxed font-medium">I authorize E-ivuze to securely process, encrypt, and archive my clinical records for authorized medical consultations and diagnostic tracking.</p>
                                                    <InputError msg={errors.digitalConsent} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={step === 4 ? handleSubmit : handleNext}
                                        disabled={loading}
                                        className="flex-1 bg-[#006838] hover:bg-[#005a30] text-white py-5 text-sm font-semibold transition-all active:scale-[0.98]"
                                    >
                                        {loading ? "Saving Profile..." : step === 4 ? "Complete Profile Setup" : "Continue to Next Step"}
                                    </button>
                                    {step > 1 && (
                                        <button type="button" onClick={handleBack} className="px-10 py-5 text-sm font-semibold text-[#006838]/40 hover:text-[#006838] transition-colors border-2 border-gray-100">
                                            Go Back
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Onboarding;
