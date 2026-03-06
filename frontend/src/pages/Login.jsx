import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import { AdminContext } from "../context/AdminContext";
import { DoctorContext } from "../context/DoctorContext";
import { HospitalContext } from "../context/HospitalContext";
import { PharmacyContext } from "../context/PharmacyContext";
import { LabContext } from "../context/LabContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useGoogleLogin } from "@react-oauth/google";
import SEO from "../components/SEO";
import { LoadingComponents } from "../components/LoadingComponents";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const AUTH_BG_IMAGE = "https://i0.wp.com/s-fdp.org/wp-content/uploads/2022/06/telemed.jpg?fit=679%2C452&ssl=1";

const Login = () => {

  const { backendUrl, setToken, setPageLoading } = useContext(AppContext)
  const { setAToken } = useContext(AdminContext)
  const { setDToken } = useContext(DoctorContext)
  const { loginHospital, setHToken, setHospital } = useContext(HospitalContext)
  const { loginPharmacy } = useContext(PharmacyContext)
  const { setLToken } = useContext(LabContext)
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Google Login Handler
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setPageLoading(true);
        // Get user info from Google
        const userInfoResponse = await axios.get(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
        );
        const googleUser = userInfoResponse.data;

        // Try to login as DOCTOR first (to prevent duplicate patient accounts)
        try {
          const { data } = await axios.post(backendUrl + '/api/doctor/google-login', {
            googleId: googleUser.sub,
            email: googleUser.email,
            name: googleUser.name,
            image: googleUser.picture
          });

          if (data.success) {
            localStorage.setItem('dToken', data.token);
            setDToken(data.token);
            toast.success(t('nav.login'));
            navigate('/');
            return;
          } else {
            throw new Error(data.message || 'Not a doctor');
          }
        } catch (doctorError) {
          // Not a doctor, try patient login
          const patientData = await axios.post(backendUrl + '/api/user/google-login', {
            googleId: googleUser.sub,
            email: googleUser.email,
            name: googleUser.name,
            image: googleUser.picture
          });
          const patientResult = patientData.data;

          if (patientResult.success) {
            localStorage.setItem('token', patientResult.token);
            setToken(patientResult.token);
            toast.success(t('nav.login'));
            navigate('/');
            return;
          } else if (patientResult.isDoctor) {
            toast.error('This email is registered as a doctor. Please use doctor login.');
            return;
          } else if (patientResult.requiresRegistration) {
            // Patient account not found — try lab login before giving up
            try {
              const labResponse = await axios.post(backendUrl + '/api/lab/google-login', {
                googleId: googleUser.sub,
                email: googleUser.email,
                name: googleUser.name,
                image: googleUser.picture
              });
              const labResult = labResponse.data;

              if (labResult.success) {
                localStorage.setItem('lToken', labResult.token);
                setLToken(labResult.token);
                toast.success(t('nav.login'));
                navigate('/lab-dashboard');
                return;
              }
            } catch (labError) {
              // Lab login also failed
            }
            // No account found in any role — show clear error
            toast.error('No account found for this Google account. Please register first.');
            navigate('/register');
            return;
          } else {
            toast.error(patientResult.message || 'Google login failed. Please try again.');
            return;
          }
        }
      } catch (error) {
        console.error('Google login error:', error);
        toast.error(t('pages.login.googleLoginFailed') || 'Google login failed. Please try again.');
      } finally {
        // Keeping page loading for Google OAuth as it's a major transition
        setPageLoading(false);
      }
    },
    onError: () => {
      toast.error(t('pages.login.googleLoginFailed') || 'Google login failed. Please try again.');
    }
  });

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    try {
      if (submitting) return;
      setSubmitting(true);
      // Removed setPageLoading(true) as per user request

      // Login - Try admin first, then fall back through every role automatically
      let loginSuccess = false;
      let lastErrorMessage = '';

      const attemptAdminLogin = async () => {
        try {
          const adminResponse = await axios.post(backendUrl + '/api/admin/login', { password, email });
          if (adminResponse.data.success) {
            localStorage.setItem('aToken', adminResponse.data.token);
            setAToken(adminResponse.data.token);
            toast.success(t('nav.login'));
            navigate('/admin-dashboard');
            return { success: true };
          }
          return { success: false, message: adminResponse.data.message };
        } catch (adminError) {
          return {
            success: false,
            message: adminError.response?.data?.message || adminError.message
          };
        }
      };

      const attemptPatientLogin = async () => {
        try {
          const { data } = await axios.post(backendUrl + '/api/user/login', { password, email });
          if (data.success) {
            localStorage.setItem('token', data.token);
            setToken(data.token);
            toast.success(t('nav.login'));
            navigate('/');
            return { success: true };
          }
          return { success: false, message: data.message };
        } catch (error) {
          return { success: false, message: error.response?.data?.message || error.message };
        }
      };

      const attemptDoctorLogin = async () => {
        try {
          const { data } = await axios.post(backendUrl + '/api/doctor/login', { password, email });
          if (data.success) {
            localStorage.setItem('dToken', data.token);
            setDToken(data.token);
            toast.success(t('nav.login'));
            navigate('/');
            return { success: true };
          }
          return { success: false, message: data.message };
        } catch (error) {
          return { success: false, message: error.response?.data?.message || error.message };
        }
      };

      const attemptHospitalLogin = async () => {
        try {
          const result = await loginHospital(email, password);
          if (result.success) {
            if (result.data.hospital.status === 'APPROVED') {
              navigate('/hospital-dashboard');
            } else {
              navigate('/hospital-pending');
            }
            return { success: true };
          }
          return { success: false, message: result.message };
        } catch (error) {
          return { success: false, message: error.response?.data?.message || error.message };
        }
      };

      const attemptPharmacyLogin = async () => {
        try {
          const result = await loginPharmacy(email, password);
          if (result.success) {
            navigate('/pharmacy-dashboard');
            return { success: true };
          }
          return { success: false, message: result.message };
        } catch (error) {
          return { success: false, message: error.response?.data?.message || error.message };
        }
      };

      const attemptLabLogin = async () => {
        try {
          const { data } = await axios.post(backendUrl + '/api/lab/login', { password, email });
          if (data.success) {
            localStorage.setItem('lToken', data.token);
            setLToken(data.token);
            toast.success(t('nav.login'));
            navigate('/lab-dashboard');
            return { success: true };
          }
          return { success: false, message: data.message };
        } catch (error) {
          return { success: false, message: error.response?.data?.message || error.message };
        }
      };

      const adminAttempt = await attemptAdminLogin();
      if (adminAttempt.success) {
        loginSuccess = true;
      } else if (adminAttempt.message) {
        lastErrorMessage = adminAttempt.message;
      }

      const fallbacks = [
        attemptPatientLogin,
        attemptDoctorLogin,
        attemptHospitalLogin,
        attemptPharmacyLogin,
        attemptLabLogin
      ];

      for (const attempt of fallbacks) {
        if (loginSuccess) break;
        const result = await attempt();
        if (result.success) {
          loginSuccess = true;
          break;
        }
        if (result.message) {
          lastErrorMessage = result.message;
        }
      }

      if (!loginSuccess) {
        toast.error(lastErrorMessage || t('pages.login.loginFailed') || 'Unable to login with those credentials.');
      }
    } catch (error) {
      console.error('Auth error:', error);
      if (error.response) {
        toast.error(error.response.data?.message || 'Login failed');
      } else if (error.request) {
        toast.error('Network error. Please check your connection.');
        navigate('/network-error');
      } else {
        toast.error(error.message || 'An error occurred');
      }
    } finally {
      setSubmitting(false);
      // setPageLoading(false); 
    }

  };

  const loginDescription = t('pages.login.globalLoginDescription') || 'Use one secure login to access every e-Ivuze workspace.';

  return (
    <div className="relative min-h-screen bg-white font-outfit text-[#006838]">
      <SEO title="System Access | E-ivuze" description="Secure login for health providers and patients." />

      <div className="flex flex-wrap min-h-screen">
        {/* Left Visual Side - Clean and Professional */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#006838]">
          <div
            className="absolute inset-0 opacity-[0.2] pointer-events-none"
            style={{ backgroundImage: 'url(/login-bg.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}
          />
          <div className="relative z-10 w-full p-20 flex flex-col justify-center">
            <div className="w-16 h-1 bg-[#88C250] mb-8"></div>
            <h1 className="text-5xl lg:text-6xl font-bold text-white font-merriweather leading-tight mb-6">
              Official Health Portal
            </h1>
          </div>
        </div>

        {/* Right Form Side - Focused and Official */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 bg-white overflow-y-auto">
          <div className="w-full max-w-md space-y-12">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-[#006838] font-merriweather leading-tight">
                Get Started
              </h2>
              <div className="w-12 h-1 bg-[#88C250]"></div>
            </div>

            <div className="space-y-6">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-4 border-2 border-gray-100 py-5 hover:bg-gray-50 transition-all font-semibold text-sm text-[#006838] hover:border-[#88C250]"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                <span className="relative px-4 bg-white mx-auto text-[10px] font-bold text-[#006838]/30   tracking-[0.2em]">OR SECURE CREDENTIALS</span>
              </div>
            </div>

            <form onSubmit={onSubmitHandler} className="space-y-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#006838]/60   tracking-wider">Email Address</label>
                  <input
                    className="w-full border-2 border-gray-100 px-5 py-4 text-sm focus:border-[#88C250] outline-none transition-all placeholder:text-gray-300 font-semibold text-[#006838]"
                    type="email"
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                    required
                    placeholder="name@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-[#006838]/60   tracking-wider">Password</label>
                  </div>
                  <input
                    className="w-full border-2 border-gray-100 px-5 py-4 text-sm focus:border-[#88C250] outline-none transition-all placeholder:text-gray-300 font-semibold text-[#006838]"
                    type="password"
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                    required
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <button
                  disabled={submitting}
                  type="submit"
                  className="w-full bg-[#006838] text-white py-5 text-sm font-semibold hover:bg-[#88C250] hover:text-[#006838] transition-all active:scale-[0.98] border-2 border-[#006838]"
                >
                  {submitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <LoadingComponents.ButtonLoader />
                      <span>Authenticating...</span>
                    </div>
                  ) : "Confirm Identity"}
                </button>
              </div>
            </form>

            <p className="text-center text-xs font-bold text-[#006838]/40 pt-6">
              Identity Enrollment Required?{" "}
              <Link to="/register" className="text-[#88C250] hover:text-[#006838] transition-colors underline decoration-2 underline-offset-8">
                Enroll Here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
