import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { DoctorContext } from "../context/DoctorContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import { specialityData } from "../assets/assets";
import { useTranslation } from "react-i18next";
import { useGoogleLogin } from "@react-oauth/google";
import SEO from "../components/SEO";
import GoogleRoleSelection from "../components/GoogleRoleSelection";
import GoogleDoctorForm from "../components/GoogleDoctorForm";
import GooglePatientForm from "../components/GooglePatientForm";
import { LoadingComponents } from "../components/LoadingComponents";
import AISuggestionButton from "../components/AISuggestionButton";

const AUTH_BG_IMAGE = "https://i0.wp.com/s-fdp.org/wp-content/uploads/2022/06/telemed.jpg?fit=679%2C452&ssl=1";

const DOCTOR_REGISTER_DRAFT_KEY = 'doctor_register_draft_v1';

const Register = () => {
  const { backendUrl, setToken, setPageLoading } = useContext(AppContext);
  const { setDToken } = useContext(DoctorContext);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [role, setRole] = useState('Patient'); // Patient or Doctor
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("male");

  // Google OAuth states
  const [googleUserData, setGoogleUserData] = useState(null);
  const [googleRole, setGoogleRole] = useState(null);
  const [showGoogleDoctorForm, setShowGoogleDoctorForm] = useState(false);
  const [showGooglePatientForm, setShowGooglePatientForm] = useState(false);

  // Doctor-specific fields
  const [speciality, setSpeciality] = useState("");
  const [degree, setDegree] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [experience, setExperience] = useState("");
  const [about, setAbout] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1: Account, 2: Professional, 3: Profile

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateStep = () => {
    if (step === 1) {
      if (!name || !email || !password || !gender) {
        toast.error(t('modals.addPatientTitle') || 'Please fill all required fields');
        return false;
      }
      if (!email.includes('@')) {
        toast.error(t('pages.login.enterValidEmail') || 'Please enter a valid email');
        return false;
      }
      if (password.length < 8) {
        toast.error(t('pages.login.passwordMinLength') || 'Password must be at least 8 characters');
        return false;
      }
      return true;
    }

    if (step === 2 && role === 'Doctor') {
      if (!speciality || !degree || !licenseNumber || !experience) {
        toast.error(t('modals.addPatientTitle') || 'Please fill all required fields');
        return false;
      }
      if (licenseNumber.trim().length < 5) {
        toast.error(t('pages.login.licensePlaceholder') || 'License number must be at least 5 characters');
        return false;
      }
      return true;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  // Restore draft when switching to Doctor role
  useEffect(() => {
    if (role !== 'Doctor') return;
    try {
      const raw = localStorage.getItem(DOCTOR_REGISTER_DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw);
      if (!draft || typeof draft !== 'object') return;

      if (typeof draft.name === 'string' && !name) setName(draft.name);
      if (typeof draft.email === 'string' && !email) setEmail(draft.email);
      if (typeof draft.speciality === 'string' && !speciality) setSpeciality(draft.speciality);
      if (typeof draft.gender === 'string' && !gender) setGender(draft.gender);
      if (typeof draft.degree === 'string' && !degree) setDegree(draft.degree);
      if (typeof draft.licenseNumber === 'string' && !licenseNumber) setLicenseNumber(draft.licenseNumber);
      if (typeof draft.experience === 'string' && !experience) setExperience(draft.experience);
      if (typeof draft.about === 'string' && !about) setAbout(draft.about);
      if (typeof draft.addressLine1 === 'string' && !addressLine1) setAddressLine1(draft.addressLine1);
      if (typeof draft.addressLine2 === 'string' && !addressLine2) setAddressLine2(draft.addressLine2);
    } catch { }
  }, [role]);

  // Persist draft for doctors
  useEffect(() => {
    if (role !== 'Doctor') return;
    try {
      const draft = { name, email, speciality, gender, degree, licenseNumber, experience, about, addressLine1, addressLine2 };
      localStorage.setItem(DOCTOR_REGISTER_DRAFT_KEY, JSON.stringify(draft));
    } catch { }
  }, [role, name, email, speciality, gender, degree, licenseNumber, experience, about, addressLine1, addressLine2]);

  const handleGoogleRegister = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setPageLoading(true);
        const userInfoResponse = await axios.get(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
        );
        setGoogleUserData(userInfoResponse.data);
      } catch (error) {
        console.error('Google registration error:', error);
        toast.error('Google registration failed.');
      } finally {
        setPageLoading(false);
      }
    },
    onError: () => toast.error('Google registration failed.')
  });

  const handleGoogleRoleSelect = (selectedRole) => {
    setGoogleRole(selectedRole);
    if (selectedRole === 'Doctor') {
      setShowGoogleDoctorForm(true);
    } else {
      setShowGooglePatientForm(true);
    }
  };

  const handleGooglePatientRegistration = async (formData) => {
    try {
      setSubmitting(true);
      const { data } = await axios.post(backendUrl + '/api/user/google-register', formData);
      if (data.success) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        toast.success('Account created successfully!');
        navigate('/onboarding');
      } else {
        toast.error(data.message || 'Registration failed');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleDoctorRegistration = async (formData) => {
    try {
      setSubmitting(true);
      const doctorFormData = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'imageFile' && formData[key]) {
          doctorFormData.append('image', formData[key]);
        } else {
          doctorFormData.append(key, formData[key]);
        }
      });

      const { data } = await axios.post(backendUrl + '/api/doctor/google-register', doctorFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (data.success) {
        localStorage.removeItem(DOCTOR_REGISTER_DRAFT_KEY);
        if (data.requiresApproval) {
          toast.info('Your account is pending approval.');
        } else {
          toast.success('Doctor account created successfully!');
        }
        navigate('/');
      } else {
        toast.error(data.message || 'Registration failed');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      if (submitting) return;
      setSubmitting(true);

      if (role === 'Patient') {
        const { data } = await axios.post(backendUrl + '/api/user/register', { name, email, password, gender });
        if (data.success) {
          localStorage.setItem('token', data.token);
          setToken(data.token);
          toast.success('Account created successfully!');
          navigate('/onboarding');
        } else {
          toast.error(data.message || 'Registration failed');
        }
      } else {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('gender', gender);
        formData.append('speciality', speciality);
        formData.append('degree', degree);
        formData.append('licenseNumber', licenseNumber);
        formData.append('experience', experience);
        formData.append('about', about);
        formData.append('address', JSON.stringify({ line1: addressLine1, line2: addressLine2 }));
        if (image) formData.append('image', image);

        const { data } = await axios.post(backendUrl + '/api/doctor/register', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (data.success) {
          localStorage.removeItem(DOCTOR_REGISTER_DRAFT_KEY);
          if (data.requiresApproval) {
            toast.info('Account pending approval.');
          } else if (data.token) {
            localStorage.setItem('dToken', data.token);
            setDToken(data.token);
          }
          toast.success('Doctor account created successfully!');
          navigate('/');
        } else {
          toast.error(data.message || 'Registration failed');
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  const signupDescription = t('pages.login.globalSignupDescription') || 'Create a patient or doctor account to start booking visits and managing care.';

  return (
    <div className="relative min-h-screen bg-white font-outfit text-[#006838]">
      <SEO title="Enrollment | E-ivuze" description="Official enrollment for health providers and patients." />

      <div className="flex flex-wrap min-h-screen">
        {/* Left Visual Side - Clean and Professional */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#006838]">
          <div
            className="absolute inset-0 opacity-[0.2] pointer-events-none"
            style={{ backgroundImage: 'url(/register-bg.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}
          />
          <div className="relative z-10 w-full p-20 flex flex-col justify-center">
            <div className="w-16 h-1 bg-[#88C250] mb-8"></div>
            <h1 className="text-5xl lg:text-6xl font-bold text-white font-merriweather leading-tight mb-6">
              Official Medical Registration
            </h1>
          </div>
        </div>

        {/* Right Form Side - Focused and Official */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 bg-white overflow-y-auto">
          <div className="w-full max-w-xl space-y-12 py-10">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-[#006838] font-merriweather leading-tight">
                Get Started
              </h2>
              <div className="w-12 h-1 bg-[#88C250]"></div>
            </div>

            <div className="space-y-6">
              <button
                type="button"
                onClick={handleGoogleRegister}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-4 border-2 border-gray-100 py-5 hover:bg-gray-50 transition-all font-semibold text-sm text-[#006838] hover:border-[#88C250]"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign up with Google
              </button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                <span className="relative px-4 bg-white mx-auto text-[10px] font-bold text-[#006838]/30   tracking-[0.2em]">OR MANUAL ENROLLMENT</span>
              </div>
            </div>

            {/* Role Selection */}
            <div className="flex bg-gray-50 border-2 border-gray-100 p-1">
              {['Patient', 'Doctor'].map(option => (
                <button
                  type="button"
                  key={option}
                  onClick={() => { setRole(option); setStep(1); }}
                  className={`flex-1 py-4 text-xs font-semibold   tracking-wider transition-all ${role === option ? 'bg-[#006838] text-white' : 'text-[#006838]/40 hover:text-[#006838]'}`}
                >
                  {option}
                </button>
              ))}
            </div>

            <form onSubmit={onSubmitHandler} className="space-y-10">
              {role === "Doctor" && (
                <div className="flex items-center justify-between">
                  {[1, 2, 3].map((i) => (
                    <React.Fragment key={i}>
                      <div className={`w-10 h-10 flex items-center justify-center text-xs font-bold border-2 transition-all ${step === i ? 'bg-[#88C250] border-[#88C250] text-[#006838]' : step > i ? 'bg-[#006838] border-[#006838] text-white' : 'bg-transparent border-gray-100 text-gray-200'}`}>
                        {step > i ? '✓' : i}
                      </div>
                      {i < 3 && <div className={`flex-1 h-0.5 mx-4 ${step > i ? 'bg-[#006838]' : 'bg-gray-100'}`} />}
                    </React.Fragment>
                  ))}
                </div>
              )}

              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                {step === 1 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-[#006838]/60   tracking-wider">Full Legal Name</label>
                        <input className="w-full border-2 border-gray-100 px-5 py-4 text-sm focus:border-[#88C250] outline-none transition-all placeholder:text-gray-300 font-semibold text-[#006838]" type="text" onChange={(e) => setName(e.target.value)} value={name} required placeholder="Legal Name" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-[#006838]/60   tracking-wider">Gender</label>
                        <select className="w-full border-2 border-gray-100 px-5 py-4 text-sm focus:border-[#88C250] outline-none transition-all bg-white font-semibold text-[#006838]" onChange={(e) => setGender(e.target.value)} value={gender} required>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-[#006838]/60   tracking-wider">Email Address</label>
                      <input className="w-full border-2 border-gray-100 px-5 py-4 text-sm focus:border-[#88C250] outline-none transition-all placeholder:text-gray-300 font-semibold text-[#006838]" type="email" onChange={(e) => setEmail(e.target.value)} value={email} required placeholder="email@address.com" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-[#006838]/60   tracking-wider">Password</label>
                      <input className="w-full border-2 border-gray-100 px-5 py-4 text-sm focus:border-[#88C250] outline-none transition-all placeholder:text-gray-300 font-semibold text-[#006838]" type="password" onChange={(e) => setPassword(e.target.value)} value={password} required minLength={8} placeholder="8+ characters" />
                    </div>
                  </div>
                )}

                {role === "Doctor" && step === 2 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-[#006838]/60">Medical Speciality</label>
                        <select className="w-full border-2 border-gray-100 px-5 py-4 text-sm focus:border-[#88C250] outline-none transition-all bg-white font-medium" onChange={(e) => setSpeciality(e.target.value)} value={speciality} required>
                          <option value="">Select Domain</option>
                          {specialityData.map((item, idx) => <option key={idx} value={item.speciality}>{item.speciality}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-[#006838]/60">Clinical Experience</label>
                        <input className="w-full border-2 border-gray-100 px-5 py-4 text-sm focus:border-[#88C250] outline-none transition-all placeholder:text-gray-300 font-medium" type="text" onChange={(e) => setExperience(e.target.value)} value={experience} required placeholder="e.g. 5 Years" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#006838]/60">Educational Degree</label>
                      <input className="w-full border-2 border-gray-100 px-5 py-4 text-sm focus:border-[#88C250] outline-none transition-all placeholder:text-gray-300 font-medium" type="text" onChange={(e) => setDegree(e.target.value)} value={degree} required placeholder="MBBS, MD, etc." />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#006838]/60">Practitioner License Number</label>
                      <input className="w-full border-2 border-gray-100 px-5 py-4 text-sm focus:border-[#88C250] outline-none transition-all placeholder:text-gray-300 font-medium" type="text" onChange={(e) => setLicenseNumber(e.target.value)} value={licenseNumber} required placeholder="Registration ID" />
                    </div>
                  </div>
                )}

                {role === "Doctor" && step === 3 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#006838]/60">Professional Biography</label>
                      <textarea className="w-full border-2 border-gray-100 px-5 py-4 text-sm focus:border-[#88C250] outline-none transition-all min-h-[120px] placeholder:text-gray-300 font-medium" onChange={(e) => setAbout(e.target.value)} value={about} required placeholder="Brief clinical summary..." />
                      <AISuggestionButton context={`Doctor registration: ${name}, ${speciality}`} fieldType="doctor profile summary" backendUrl={backendUrl} onSuggestion={(s) => setAbout(s)} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#006838]/60">Clinical Location</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input className="w-full border-2 border-gray-100 px-5 py-4 text-sm focus:border-[#88C250] placeholder:text-gray-300 font-medium" placeholder="Street Address" onChange={(e) => setAddressLine1(e.target.value)} value={addressLine1} required />
                        <input className="w-full border-2 border-gray-100 px-5 py-4 text-sm focus:border-[#88C250] placeholder:text-gray-300 font-medium" placeholder="City" onChange={(e) => setAddressLine2(e.target.value)} value={addressLine2} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#006838]/60">Official Portrait (Optional)</label>
                      <div className="flex items-center gap-6 p-6 border-2 border-gray-100">
                        {imagePreview ? (
                          <div className="relative group shrink-0">
                            <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover border-2 border-[#88C250]" />
                            <button type="button" onClick={() => { setImage(null); setImagePreview(null); }} className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 flex items-center justify-center text-[10px]">X</button>
                          </div>
                        ) : (
                          <div className="w-20 h-20 bg-gray-50 flex items-center justify-center text-[#006838]/20 shrink-0">
                            <i className="lni lni-user text-3xl"></i>
                          </div>
                        )}
                        <input className="text-xs font-bold cursor-pointer" type="file" onChange={handleImageChange} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                {role === 'Doctor' && step > 1 && (
                  <button type="button" onClick={handleBack} className="flex-1 border-2 border-gray-100 py-5 text-sm font-semibold text-[#006838]/40 hover:text-[#006838] transition-all">
                    Back
                  </button>
                )}
                {role === 'Doctor' && step < 3 ? (
                  <button type="button" onClick={handleNext} className="flex-1 bg-[#006838] text-white py-5 text-sm font-semibold hover:bg-[#88C250] hover:text-[#006838] transition-all">
                    Continue
                  </button>
                ) : (
                  <button disabled={submitting} type="submit" className="flex-1 bg-[#006838] text-white py-5 text-sm font-semibold hover:bg-[#88C250] hover:text-[#006838] transition-all">
                    {submitting ? "Processing..." : "Complete Enrollment"}
                  </button>
                )}
              </div>
            </form>



            <p className="text-center text-xs font-bold text-[#006838]/40 pt-6">
              Official Identity Exists? <Link to="/login" className="text-[#88C250] hover:text-[#006838] transition-colors underline decoration-2 underline-offset-8">Sign In</Link>
            </p>
          </div>
        </div>
      </div>

      {googleUserData && !googleRole && (
        <div className="fixed inset-0 bg-[#006838]/95 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <GoogleRoleSelection onSelectRole={handleGoogleRoleSelect} googleUserData={googleUserData} />
        </div>
      )}

      {showGooglePatientForm && googleUserData && (
        <div className="fixed inset-0 bg-[#006838]/95 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-md">
          <GooglePatientForm
            googleUserData={googleUserData}
            onSubmit={handleGooglePatientRegistration}
            onCancel={() => { setShowGooglePatientForm(false); setGoogleUserData(null); }}
            submitting={submitting}
          />
        </div>
      )}

      {showGoogleDoctorForm && googleUserData && (
        <div className="fixed inset-0 bg-[#006838]/95 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-md">
          <GoogleDoctorForm
            googleUserData={googleUserData}
            onSubmit={handleGoogleDoctorRegistration}
            backendUrl={backendUrl}
            onCancel={() => { setShowGoogleDoctorForm(false); setGoogleUserData(null); }}
            submitting={submitting}
          />
        </div>
      )}
    </div>
  );
};

export default Register;
