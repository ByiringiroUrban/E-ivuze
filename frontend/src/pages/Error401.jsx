import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';

const Error401 = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <SEO
        title="401 - Unauthorized | E-ivuzeConnect"
        description="You are not authorized to access this page."
      />
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-red-500 opacity-20">401</h1>
          <h2 className="text-3xl font-semibold text-gray-800 mt-4">
            {t('errors.401.title') || 'Unauthorized Access'}
          </h2>
          <p className="text-gray-600 mt-4">
            {t('errors.401.description') || 'You need to be logged in to access this page. Please sign in to continue.'}
          </p>
        </div>
        <div className="space-y-4">
          <Link
            to="/login"
            className="block w-full bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition"
          >
            {t('errors.401.login') || 'Sign In'}
          </Link>
          <button
            onClick={() => navigate(-1)}
            className="w-full bg-white text-gray-700 border-2 border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 transition"
          >
            {t('errors.401.goBack') || 'Go Back'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Error401;

