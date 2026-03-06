import React from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitch from '../components/LanguageSwitch';
import { assets } from '../assets/assets';

const TermsOfService = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[#fcfdfd] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-50/50 rounded-full blur-3xl -z-10 -ml-48 -mt-24" />
      <LanguageSwitch />
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="bg-white shadow-[0_15px_60px_-15px_rgba(0,104,56,0.08)] rounded-sm p-8 md:p-12 border border-emerald-50/50">
          {/* Header */}
          <div className="mb-10 text-center">
            <img className="mx-auto mb-6 w-40 h-auto object-contain" src={assets.logo} alt="Logo" />
            <h1 className="text-4xl font-bold text-[#081828] mb-4 font-merriweather">{t('pages.termsOfService.title')}</h1>
            <div className="w-16 h-1 bg-[#88C250] mx-auto mb-6"></div>
            <p className="text-[#006838]/60 font-medium uppercase tracking-widest text-xs">{t('pages.termsOfService.lastUpdated')}</p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none space-y-6 text-gray-500">
            <section>
              <h2 className="text-2xl font-bold text-[#006838] mb-4 font-merriweather">{t('pages.termsOfService.section1.title')}</h2>
              <p className="leading-7">{t('pages.termsOfService.section1.content')}</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#006838] mb-4 font-merriweather">{t('pages.termsOfService.section2.title')}</h2>
              <p className="leading-7 mb-4">{t('pages.termsOfService.section2.content')}</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>{t('pages.termsOfService.section2.item1')}</li>
                <li>{t('pages.termsOfService.section2.item2')}</li>
                <li>{t('pages.termsOfService.section2.item3')}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#006838] mb-4 font-merriweather">{t('pages.termsOfService.section3.title')}</h2>
              <p className="leading-7">{t('pages.termsOfService.section3.content')}</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#006838] mb-4 font-merriweather">{t('pages.termsOfService.section4.title')}</h2>
              <p className="leading-7">{t('pages.termsOfService.section4.content')}</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#006838] mb-4 font-merriweather">{t('pages.termsOfService.section5.title')}</h2>
              <p className="leading-7">{t('pages.termsOfService.section5.content')}</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#006838] mb-4 font-merriweather">{t('pages.termsOfService.section6.title')}</h2>
              <p className="leading-7">{t('pages.termsOfService.section6.content')}</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#006838] mb-4 font-merriweather">{t('pages.termsOfService.section7.title')}</h2>
              <p className="leading-7">{t('pages.termsOfService.section7.content')}</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#006838] mb-4 font-merriweather">{t('pages.termsOfService.section8.title')}</h2>
              <p className="leading-7">{t('pages.termsOfService.section8.content')}</p>
            </section>
          </div>

          {/* Contact Section */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-gray-600">
              <strong>{t('pages.termsOfService.contact.title')}</strong> {t('pages.termsOfService.contact.content')}
            </p>
            <p className="text-gray-600 mt-2">
              <strong>{t('pages.termsOfService.contact.email')}</strong> team@E-ivuze.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;

