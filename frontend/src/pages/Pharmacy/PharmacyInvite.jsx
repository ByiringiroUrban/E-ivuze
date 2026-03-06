import React, { useState, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PharmacyContext } from '../../context/PharmacyContext';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { assets } from '../../assets/assets';
import SEO from '../../components/SEO';
import DashboardHero from '../../components/DashboardHero';
import { LoadingComponents } from '../../components/LoadingComponents';
import { FaPaperPlane } from 'react-icons/fa'; // Added FaPaperPlane import

const PharmacyInvite = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { acceptInvitation } = useContext(PharmacyContext);

  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    name: '',
    password: '',
    confirmPassword: '',
    acceptTOS: false,
    acceptPrivacy: false
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = t('pharmacy.invite.errors.nameRequired') || 'Name is required';
    }

    if (!formData.password) {
      newErrors.password = t('pharmacy.invite.errors.passwordRequired') || 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = t('pharmacy.invite.errors.passwordMin') || 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('pharmacy.invite.errors.passwordMatch') || 'Passwords do not match';
    }

    if (!formData.acceptTOS) {
      newErrors.acceptTOS = t('pharmacy.invite.errors.tosRequired') || 'You must accept the Terms of Service';
    }

    if (!formData.acceptPrivacy) {
      newErrors.acceptPrivacy = t('pharmacy.invite.errors.privacyRequired') || 'You must accept the Privacy Policy';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      alert(t('pharmacy.invite.errors.noToken') || 'Invalid invitation link');
      return;
    }

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const result = await acceptInvitation({
        token,
        name: formData.name.trim(),
        password: formData.password,
        acceptTOS: formData.acceptTOS,
        acceptPrivacy: formData.acceptPrivacy
      });

      if (result.success) {
        navigate('/pharmacy-dashboard');
      }
    } catch (error) {
      console.error('Invitation acceptance error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center px-4">
        <div className="border border-border bg-white p-10 max-w-md w-full text-center">
          <p className="text-xs   tracking-[0.4em] text-red-500">{t('pharmacy.invite.invalidToken') || 'Invalid Invitation Link'}</p>
          <h2 className="text-2xl font-semibold text-accent mt-4">
            {t('pharmacy.invite.invalidTokenMessage') || 'This invitation link is invalid or has expired.'}
          </h2>
          <button
            onClick={() => navigate('/login')}
            className="mt-8 w-full border border-accent px-6 py-3 text-xs   tracking-[0.4em] hover:bg-accent hover:text-white transition"
          >
            {t('pharmacy.invite.goToLogin') || 'Go to Login'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <SEO
        title="Pharmacy Invitation - One Healthline Connect"
        description="Complete your pharmacy registration"
      />
      <div className="grid lg:grid-cols-[1fr_0.9fr] min-h-screen">
        <div className="bg-[#14324f] text-white p-8 sm:p-12 lg:p-16 flex flex-col gap-10">
          <div>
            <img src={assets.logo} alt="E-ivuzeConnect" className="w-36 mb-6" />
            <p className="text-xs   tracking-[0.5em] text-white/70">{t('pharmacy.invite.eyebrow') || 'Partner Onboarding'}</p>
            <h1 className="text-3xl sm:text-4xl font-semibold mt-4">
              {t('pharmacy.invite.heroTitle') || 'Activate your clinical supply workspace'}
            </h1>
            <p className="text-sm sm:text-base text-white/80 mt-4 leading-relaxed">
              {t('pharmacy.invite.heroCopy') || 'This invite links your pharmacy to E-ivuzeso prescriptions, stock levels and reimbursement run from the same secure account.'}
            </p>
          </div>
          <ul className="space-y-4 text-sm">
            <li className="flex gap-3">
              <span className="text-white/70 tracking-[0.4em] text-[10px]  ">01</span>
              <p>{t('pharmacy.invite.pointOne') || 'Verify the token and set a secure administrator password.'}</p>
            </li>
            <li className="flex gap-3">
              <span className="text-white/70 tracking-[0.4em] text-[10px]  ">02</span>
              <p>{t('pharmacy.invite.pointTwo') || 'Accept the compliance terms so we can sync prescriptions immediately.'}</p>
            </li>
            <li className="flex gap-3">
              <span className="text-white/70 tracking-[0.4em] text-[10px]  ">03</span>
              <p>{t('pharmacy.invite.pointThree') || 'Sign in to start confirming orders and managing deliveries.'}</p>
            </li>
          </ul>
        </div>

        <div className="flex items-center justify-center px-4 sm:px-8 py-14 bg-white">
          <div className="w-full max-w-md border border-border bg-white p-6 sm:p-8">
            <div className="space-y-2 text-center">
              <p className="text-xs   tracking-[0.4em] text-primary-dark">{t('pharmacy.invite.title') || 'Complete Your Registration'}</p>
              <h2 className="text-2xl font-semibold text-accent">
                {t('pharmacy.invite.subtitle') || 'Set up your pharmacy administrator account'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('pharmacy.invite.name') || 'Full Name'} *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w - full px - 4 py - 2 border roun - lg focus: outline - none focus: ring - 2 focus: ring - primary ${errors.name ? 'border-red-500' : 'border-gray-300'
                    } `}
                  placeholder={t('pharmacy.invite.namePlaceholder') || 'Enter your full name'}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('pharmacy.invite.password') || 'Password'} *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w - full px - 4 py - 2 border roun - lg focus: outline - none focus: ring - 2 focus: ring - primary ${errors.password ? 'border-red-500' : 'border-gray-300'
                    } `}
                  placeholder={t('pharmacy.invite.passwordPlaceholder') || 'Enter password (min 6 characters)'}
                />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('pharmacy.invite.confirmPassword') || 'Confirm Password'} *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w - full px - 4 py - 2 border roun - lg focus: outline - none focus: ring - 2 focus: ring - primary ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    } `}
                  placeholder={t('pharmacy.invite.confirmPasswordPlaceholder') || 'Confirm your password'}
                />
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>

              <div className="space-y-2">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    name="acceptTOS"
                    checked={formData.acceptTOS}
                    onChange={handleChange}
                    className="mt-1 mr-2"
                  />
                  <span className="text-sm text-gray-700">
                    {t('pharmacy.invite.acceptTOS') || 'I accept the'} {' '}
                    <a href="/terms-of-service" target="_blank" className="text-primary hover:underline">
                      {t('pharmacy.invite.termsOfService') || 'Terms of Service'}
                    </a>
                    {errors.acceptTOS && <span className="text-red-500 text-xs block mt-1">{errors.acceptTOS}</span>}
                  </span>
                </label>

                <label className="flex items-start">
                  <input
                    type="checkbox"
                    name="acceptPrivacy"
                    checked={formData.acceptPrivacy}
                    onChange={handleChange}
                    className="mt-1 mr-2"
                  />
                  <span className="text-sm text-gray-700">
                    {t('pharmacy.invite.acceptPrivacy') || 'I accept the'} {' '}
                    <a href="/privacy-policy" target="_blank" className="text-primary hover:underline">
                      {t('pharmacy.invite.privacyPolicy') || 'Privacy Policy'}
                    </a>
                    {errors.acceptPrivacy && <span className="text-red-500 text-xs block mt-1">{errors.acceptPrivacy}</span>}
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading} // Keep disabled attribute
                className="w-full bg-primary text-white py-3 roun-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2" // Added flex, items-center, justify-center, gap-2
              >
                <FaPaperPlane /> {/* Added FaPaperPlane icon */}
                {loading ? <LoadingComponents.ButtonLoader /> : (t('pharmacy.invite.send') || 'Send Invitation')} {/* Changed text and added ButtonLoader */}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-4">
              {t('pharmacy.invite.alreadyHaveAccount') || 'Already have an account?'}{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-primary hover:underline"
              >
                {t('pharmacy.invite.login') || 'Login'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacyInvite;

