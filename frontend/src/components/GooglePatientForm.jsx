import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const GooglePatientForm = ({ googleUserData, onSubmit, onCancel, submitting }) => {
    const { t } = useTranslation();
    const [gender, setGender] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = {
            googleId: googleUserData.sub,
            email: googleUserData.email,
            name: googleUserData.name,
            image: googleUserData.picture,
            gender: gender
        };
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-md border border-border bg-white/95 shadow-2xl p-6 sm:p-8 space-y-6 text-sm text-zinc-700 rounded-lg">
            <div className="space-y-2 text-center">
                <p className="text-xs   tracking-[0.4em] text-primary-dark">
                    {t('pages.login.completeProfile') || 'Almost There'}
                </p>
                <h2 className="text-2xl font-semibold text-accent">
                    {t('pages.login.justOneMoreThing') || 'Welcome, ' + (googleUserData?.given_name || 'User')}
                </h2>
                <p className="text-muted-foreground">
                    {t('pages.login.googlePatientDesc') || 'Please confirm your gender to complete your registration. You will set up your full clinical profile in the next step.'}
                </p>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="  text-[11px] tracking-[0.3em] text-muted-foreground">
                        {t('pages.login.gender') || 'Gender'} *
                    </label>
                    <select
                        className="w-full border border-border px-4 py-3 mt-2 focus:border-primary focus:ring-1 focus:ring-primary transition-all rounded"
                        onChange={(e) => setGender(e.target.value)}
                        value={gender}
                        required
                    >
                        <option value="" disabled>{t('pages.login.selectGender') || 'Select Gender'}</option>
                        <option value="male">{t('pages.login.male') || 'Male'}</option>
                        <option value="female">{t('pages.login.female') || 'Female'}</option>
                    </select>
                </div>
            </div>

            <div className="flex gap-3 pt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={submitting}
                    className="flex-1 border border-border text-accent py-3 text-xs   tracking-[0.4em] hover:bg-gray-50 transition rounded disabled:opacity-50"
                >
                    {t('buttons.cancel') || 'Cancel'}
                </button>
                <button
                    type="submit"
                    disabled={submitting}
                    className="flex-2 bg-primary text-white py-3 text-xs   tracking-[0.4em] hover:bg-primary-dark transition rounded disabled:opacity-50"
                >
                    {submitting ? t('buttons.processing') : (t('buttons.continue') || 'Continue')}
                </button>
            </div>
        </form>
    );
};

export default GooglePatientForm;
