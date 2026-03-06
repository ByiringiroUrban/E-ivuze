import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminContext } from '../../context/AdminContext';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import SEO from '../../components/SEO';

const HospitalRegisterAdmin = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { registerHospitalByAdmin, aToken } = useContext(AdminContext);
  const [submitting, setSubmitting] = useState(false);

  // Hospital Information
  const [hospitalName, setHospitalName] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('Rwanda');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');

  // Admin User Information
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  if (!aToken) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="max-w-md text-center space-y-4 p-8 border border-border bg-white shadow-sm">
          <p className="text-xs   tracking-[0.4em] text-primary-dark">
            {t('hospital.register.title')}
          </p>
          <h1 className="text-2xl font-semibold text-accent">
            {t('hospital.register.subtitle')}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t('hospital.register.authRequired') || 'Please login with an admin account to register hospitals.'}
          </p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-primary text-white text-xs   tracking-[0.35em] hover:bg-primary-dark transition"
          >
            {t('buttons.login')}
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!hospitalName.trim() || !addressLine1.trim() || !city.trim() || !phone.trim()) {
      toast.error(t('hospital.register.missingHospitalInfo') || 'Please fill in all required hospital details.');
      return;
    }

    if (!adminName.trim() || !adminEmail.trim()) {
      toast.error(t('hospital.register.missingAdminInfo') || 'Please fill in all required admin details.');
      return;
    }

    if (adminPassword !== confirmPassword) {
      toast.error(t('hospital.register.passwordMismatch') || 'Passwords do not match');
      return;
    }

    if (adminPassword.length < 8) {
      toast.error(t('hospital.register.passwordLength') || 'Password must be at least 8 characters');
      return;
    }

    setSubmitting(true);

    const result = await registerHospitalByAdmin({
      name: hospitalName.trim(),
      address: {
        line1: addressLine1.trim(),
        line2: addressLine2.trim(),
        city: city.trim(),
        country: country.trim() || 'Rwanda'
      },
      phone: phone.trim(),
      website: website.trim(),
      adminName: adminName.trim(),
      adminEmail: adminEmail.trim(),
      adminPassword
    });

    setSubmitting(false);

    if (result.success) {
      // Reset form
      setHospitalName('');
      setAddressLine1('');
      setAddressLine2('');
      setCity('');
      setCountry('Rwanda');
      setPhone('');
      setWebsite('');
      setAdminName('');
      setAdminEmail('');
      setAdminPassword('');
      setConfirmPassword('');

      // Stay on the page or redirect to admin dashboard
      // Don't redirect to pending page since it's auto-approved
      navigate('/admin-dashboard');
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <SEO
        title="Hospital Registration - E-ivuzeConnect"
        description="Admins can provision new hospitals for E-ivuzeConnect."
      />

      <section className="bg-[#14324f] text-white px-4 sm:px-8 lg:px-16 py-12 sm:py-16 roun-b-2xl shadow-inner">
        <div className="max-w-4xl space-y-4">
          <p className="text-xs   tracking-[0.5em] text-white/70">{t('hospital.register.title')}</p>
          <h1 className="text-3xl sm:text-4xl font-semibold">{t('hospital.register.subtitle')}</h1>
          <p className="text-sm sm:text-base text-white/80 leading-relaxed">
            {t('hospital.register.adminNote') || 'Provision trusted hospital accounts so facilities can manage approvals, referrals and pharmacy coordination directly inside E-ivuze.'}
          </p>
        </div>
      </section>

      <section className="py-10 sm:py-14">
        <div className="w-full px-4 sm:px-8 lg:px-12">
          <form onSubmit={handleSubmit} className="border border-border bg-white shadow-lg p-6 sm:p-8 space-y-8 roun-lg">
            <div className="space-y-2">
              <p className="text-xs   tracking-[0.4em] text-primary-dark">{t('hospital.register.hospitalInfo')}</p>
              <p className="text-sm text-muted-foreground">{t('hospital.register.hospitalInfoDescription')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="  text-[11px] tracking-[0.3em] text-muted-foreground">{t('hospital.register.hospitalName')}</label>
                <input
                  type="text"
                  required
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  className="w-full border border-border px-4 py-3 mt-2"
                />
              </div>
              <div>
                <label className="  text-[11px] tracking-[0.3em] text-muted-foreground">{t('hospital.register.addressLine1')}</label>
                <input
                  type="text"
                  required
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  className="w-full border border-border px-4 py-3 mt-2"
                />
              </div>
              <div>
                <label className="  text-[11px] tracking-[0.3em] text-muted-foreground">{t('hospital.register.addressLine2')}</label>
                <input
                  type="text"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  className="w-full border border-border px-4 py-3 mt-2"
                />
              </div>
              <div>
                <label className="  text-[11px] tracking-[0.3em] text-muted-foreground">{t('hospital.register.city')}</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full border border-border px-4 py-3 mt-2"
                />
              </div>
              <div>
                <label className="  text-[11px] tracking-[0.3em] text-muted-foreground">{t('hospital.register.country')}</label>
                <input
                  type="text"
                  required
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full border border-border px-4 py-3 mt-2"
                />
              </div>
              <div>
                <label className="  text-[11px] tracking-[0.3em] text-muted-foreground">{t('hospital.register.phone')}</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-border px-4 py-3 mt-2"
                />
              </div>
              <div>
                <label className="  text-[11px] tracking-[0.3em] text-muted-foreground">{t('hospital.register.website')}</label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full border border-border px-4 py-3 mt-2"
                  placeholder="https://example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs   tracking-[0.4em] text-primary-dark">{t('hospital.register.adminAccount')}</p>
              <p className="text-sm text-muted-foreground">{t('hospital.register.adminAccountDescription')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="  text-[11px] tracking-[0.3em] text-muted-foreground">{t('hospital.register.adminName')}</label>
                <input
                  type="text"
                  required
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="w-full border border-border px-4 py-3 mt-2"
                />
              </div>
              <div>
                <label className="  text-[11px] tracking-[0.3em] text-muted-foreground">{t('hospital.register.adminEmail')}</label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full border border-border px-4 py-3 mt-2"
                />
              </div>
              <div>
                <label className="  text-[11px] tracking-[0.3em] text-muted-foreground">{t('hospital.register.adminPassword')}</label>
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full border border-border px-4 py-3 mt-2"
                  minLength={8}
                />
                <p className="text-xs text-muted-foreground mt-1">{t('hospital.register.minPassword')}</p>
              </div>
              <div>
                <label className="  text-[11px] tracking-[0.3em] text-muted-foreground">{t('hospital.register.confirmPassword')}</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-border px-4 py-3 mt-2"
                  minLength={8}
                />
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/30 px-5 py-4 text-sm text-primary-dark roun-lg">
              <strong className="  tracking-[0.4em] text-[10px] block mb-2">{t('hospital.register.note')}</strong>
              {t('hospital.register.noteText')}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-primary text-white py-3 text-xs   tracking-[0.35em] hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? t('hospital.register.submitting') : t('hospital.register.submitApplication')}
              </button>
              <button
                type="button"
                onClick={() => navigate('/hospital-approvals')}
                className="px-6 py-3 border border-border text-xs   tracking-[0.35em] text-accent hover:border-primary/60 transition"
              >
                {t('buttons.cancel') || 'Cancel'}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

export default HospitalRegisterAdmin;


