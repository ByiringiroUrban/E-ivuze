import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';

const Error404 = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <SEO
        title="404 - Page Not Found | E-ivuzeConnect"
        description="The page you are looking for could not be found."
      />
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-primary opacity-20">404</h1>
          <h2 className="text-3xl font-semibold text-gray-800 mt-4">
            {t('errors.404.title') || 'Page Not Found'}
          </h2>
          <p className="text-gray-600 mt-4">
            {t('errors.404.description') || 'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.'}
          </p>
        </div>
        <div className="space-y-4">
          <button
            onClick={() => navigate(-1)}
            className="w-full bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition"
          >
            {t('errors.404.goBack') || 'Go Back'}
          </button>
          <Link
            to="/"
            className="block w-full bg-white text-primary border-2 border-primary px-6 py-3 rounded-lg hover:bg-primary hover:text-white transition"
          >
            {t('errors.404.goHome') || 'Go to Homepage'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Error404;

