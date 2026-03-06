import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaGlobe } from 'react-icons/fa';

export default function LanguageSwitch({ variant = 'fixed' }) {
	const { i18n, t } = useTranslation();
	const [current, setCurrent] = useState(i18n.language ? i18n.language.split('-')[0] : 'rw');
	const [isChanging, setIsChanging] = useState(false);

	// Update current language when i18n language changes
	useEffect(() => {
		const updateLanguage = () => {
			const lang = i18n.language ? i18n.language.split('-')[0] : 'rw';
			setCurrent(lang);
		};

		// Listen for language changes
		i18n.on('languageChanged', updateLanguage);

		// Initial update
		updateLanguage();

		return () => {
			i18n.off('languageChanged', updateLanguage);
		};
	}, [i18n]);

	const toggle = async () => {
		if (isChanging) return; // Prevent multiple clicks

		setIsChanging(true);
		const next = current === 'rw' ? 'en' : 'rw';

		try {
			await i18n.changeLanguage(next);
			localStorage.setItem('preferredLanguage', next);
		} catch (error) {
			if (import.meta.env?.DEV) console.error('[LanguageSwitch] Error switching language:', error);
		} finally {
			setIsChanging(false);
		}
	};

	const [hidden, setHidden] = useState(localStorage.getItem('hideLanguageSwitch') === 'true');

	if (hidden && variant === 'fixed') {
		return null;
	}

	// Header variant: icon (globe) for dark app bars
	if (variant === 'headerIcon') {
		return (
			<button
				onClick={toggle}
				aria-label={current === 'rw' ? t('aria.switchToEnglish') : t('aria.switchToKinyarwanda')}
				title={current === 'rw' ? t('aria.switchToEnglish') : t('aria.switchToKinyarwanda')}
				className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
			>
				<FaGlobe className="w-5 h-5" />
			</button>
		);
	}

	// Header variant: icon (globe) for light app bars (e.g. Lab white header)
	if (variant === 'headerIconLight') {
		return (
			<button
				onClick={toggle}
				aria-label={current === 'rw' ? t('aria.switchToEnglish') : t('aria.switchToKinyarwanda')}
				title={current === 'rw' ? t('aria.switchToEnglish') : t('aria.switchToKinyarwanda')}
				className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all cursor-pointer"
			>
				<FaGlobe className="w-5 h-5" />
			</button>
		);
	}

	// Header variant: flag style
	if (variant === 'header') {
		return (
			<button
				onClick={toggle}
				aria-label={current === 'rw' ? t('aria.switchToEnglish') : t('aria.switchToKinyarwanda')}
				title={current === 'rw' ? t('aria.switchToEnglish') : t('aria.switchToKinyarwanda')}
				className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-white/30 bg-white/10 hover:bg-white/20 transition-all duration-300 hover:scale-110 cursor-pointer"
			>
				<span className="text-xl" role="img" aria-label={current === 'rw' ? 'Rwandan Flag' : 'American Flag'}>
					{current === 'rw' ? '🇷🇼' : '🇺🇸'}
				</span>
			</button>
		);
	}

	// Fixed variant (default) - original fixed button
	return (
		<div style={{
			position: 'fixed',
			right: '21px',
			bottom: '20px',
			zIndex: 99999,
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'flex-end',
			gap: '4px'
		}}>
			<button
				onClick={() => {
					setHidden(true);
					localStorage.setItem('hideLanguageSwitch', 'true');
				}}
				className="bg-gray-200 hover:bg-gray-300 text-gray-600 rounded-full w-5 h-5 flex items-center justify-center text-[10px] transition-colors shadow-sm"
				title="Hide language switch"
			>
				✕
			</button>
			<button
				onClick={toggle}
				aria-label={current === 'rw' ? t('aria.switchToEnglish') : t('aria.switchToKinyarwanda')}
				title={current === 'rw' ? t('aria.switchToEnglish') : t('aria.switchToKinyarwanda')}
				style={{
					width: '56px',
					height: '56px',
					border: '2px solid #e5e7eb',
					backgroundColor: 'white',
					boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					cursor: 'pointer',
					transition: 'all 0.3s ease',
					fontSize: '24px',
					lineHeight: '1',
					borderRadius: '12px'
				}}
				onMouseEnter={(e) => {
					e.currentTarget.style.transform = 'scale(1.1)';
					e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
				}}
				onMouseLeave={(e) => {
					e.currentTarget.style.transform = 'scale(1)';
					e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
				}}
			>
				<span style={{ fontSize: '28px', lineHeight: '1', display: 'block' }} role="img" aria-label={current === 'rw' ? 'Rwandan Flag' : 'American Flag'}>
					{current === 'rw' ? '🇷🇼' : '🇺🇸'}
				</span>
			</button>
		</div>
	);
}


