import React, { useContext, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaSearch, FaTimes, FaUserMd, FaUser, FaFileMedical, FaCalendarAlt } from 'react-icons/fa';
import { AppContext } from '../context/AppContext';
import { AdminContext } from '../context/AdminContext';
import { DoctorContext } from '../context/DoctorContext';
import { HospitalContext } from '../context/HospitalContext';
import { PharmacyContext } from '../context/PharmacyContext';
import { LabContext } from '../context/LabContext';
import { globalSearch } from '../services/searchApi';

const DEBOUNCE_MS = 300;

export default function AppBarSearch({ variant = 'dark', className = '' }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { backendUrl, token } = useContext(AppContext);
  const { aToken } = useContext(AdminContext);
  const { dToken } = useContext(DoctorContext);
  const { hToken } = useContext(HospitalContext);
  const { pToken } = useContext(PharmacyContext);
  const { lToken } = useContext(LabContext);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({ doctors: [], patients: [], records: [], appointments: [] });
  const [error, setError] = useState(null);
  const debounceRef = useRef(null);
  const inputRef = useRef(null);
  const popupRef = useRef(null);
  const ignoreNextOutsideClick = useRef(false);

  const tokens = { token, aToken, dToken, hToken, pToken, lToken };
  const hasAuth = !!(token || aToken || dToken || hToken || pToken || lToken);
  const role = aToken ? 'admin' : dToken ? 'doctor' : hToken ? 'hospital' : pToken ? 'pharmacy' : lToken ? 'lab' : token ? 'patient' : null;

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults({ doctors: [], patients: [], records: [], appointments: [] });
      setError(null);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const baseUrl = backendUrl || import.meta.env?.VITE_BACKEND_URL || '';
        const data = await globalSearch(baseUrl, query, tokens);
        if (data.success) setResults(data);
        else setError(data.message || 'Search failed');
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Search failed');
        setResults({ doctors: [], patients: [], records: [], appointments: [] });
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, backendUrl]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ignoreNextOutsideClick.current) {
        ignoreNextOutsideClick.current = false;
        return;
      }
      if (!popupRef.current) return;
      const target = e.target;
      if (popupRef.current.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener('click', handleClickOutside, true);
    return () => document.removeEventListener('click', handleClickOutside, true);
  }, []);

  const handleSelect = (item, section) => {
    setOpen(false);
    setQuery('');
    if (section === 'doctors') {
      navigate(`/doctors`);
      return;
    }
    if (section === 'patients') {
      navigate('/patients');
      return;
    }
    if (section === 'records') {
      navigate('/records');
      return;
    }
    if (section === 'appointments') {
      if (role === 'patient') navigate('/my-appointments');
      else if (role === 'doctor' || role === 'admin') navigate('/doctor-appointments');
      else navigate('/my-appointments');
      return;
    }
  };

  const isDark = variant === 'dark';
  const inputClass = isDark
    ? 'bg-white/10 border-white/20 text-white placeholder-white/60'
    : 'bg-gray-100 border-gray-200 text-gray-800 placeholder-gray-500';
  const iconBtnClass = isDark
    ? 'w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 text-white'
    : 'w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 text-gray-600';

  const totalCount = results.doctors.length + results.patients.length + results.records.length + results.appointments.length;
  const hasTypedEnough = query.trim().length >= 2;
  const showPopup = open && query.trim().length >= 1;

  if (!hasAuth) return null;

  const handleOpenSearch = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    ignoreNextOutsideClick.current = true;
    setOpen(true);
  };

  return (
    <div className={`relative shrink-0 ${className}`} ref={popupRef}>
      {!open ? (
        <button
          type="button"
          onClick={handleOpenSearch}
          className={`${iconBtnClass} cursor-pointer shrink-0`}
          aria-label={t('nav.search')}
          title={t('nav.searchPlaceholder')}
        >
          <FaSearch className="w-5 h-5" />
        </button>
      ) : (
        <div className="flex items-center gap-2 relative z-[200]">
          <div className={`relative flex items-center rounded-lg border ${inputClass} pl-3 pr-8 py-2 min-w-[180px] sm:min-w-[220px]`}>
            <FaSearch className="w-4 h-4 shrink-0 opacity-70" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('nav.searchPlaceholder')}
              className="flex-1 min-w-0 bg-transparent outline-none text-sm ml-2"
            />
            <button
              type="button"
              onClick={() => { setOpen(false); setQuery(''); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-white/10"
              aria-label="Close"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>

          {showPopup && (
            <div className="absolute top-full left-0 mt-2 w-[320px] sm:w-[380px] max-h-[70vh] overflow-y-auto bg-white rounded-xl shadow-xl border border-gray-200 z-[100]" onClick={(e) => e.stopPropagation()}>
              {!hasTypedEnough && (
                <div className="p-4 text-center text-gray-500 text-sm">
                  {t('nav.searchHint') || 'Type at least 2 characters to search doctors, patients, records...'}
                </div>
              )}
              {hasTypedEnough && loading && (
                <div className="p-4 text-center text-gray-500 text-sm">
                  {t('nav.searching') || 'Searching...'}
                </div>
              )}
              {hasTypedEnough && error && !loading && (
                <div className="p-4 text-center text-red-600 text-sm">{error}</div>
              )}
              {hasTypedEnough && !loading && !error && totalCount === 0 && (
                <div className="p-4 text-center text-gray-500 text-sm">
                  {t('nav.noResults') || 'No results found'}
                </div>
              )}
              {hasTypedEnough && !loading && totalCount > 0 && (
                <div className="py-2">
                  {results.doctors.length > 0 && (
                    <section className="px-3 py-1">
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-1">
                        <FaUserMd className="w-3.5 h-3.5" /> {t('nav.doctors') || 'Doctors'}
                      </h3>
                      {results.doctors.slice(0, 5).map((d) => (
                        <button
                          key={d._id}
                          type="button"
                          onClick={() => handleSelect(d, 'doctors')}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-3"
                        >
                          {d.image ? (
                            <img src={d.image} alt="" className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                              <FaUserMd className="w-4 h-4" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">{d.name}</p>
                            {d.speciality && <p className="text-xs text-gray-500 truncate">{d.speciality}</p>}
                          </div>
                        </button>
                      ))}
                    </section>
                  )}
                  {results.patients.length > 0 && (
                    <section className="px-3 py-1">
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-1">
                        <FaUser className="w-3.5 h-3.5" /> {t('nav.patients') || 'Patients'}
                      </h3>
                      {results.patients.slice(0, 5).map((p) => (
                        <button
                          key={p._id}
                          type="button"
                          onClick={() => handleSelect(p, 'patients')}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-3"
                        >
                          {p.image ? (
                            <img src={p.image} alt="" className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                              <FaUser className="w-4 h-4" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                            {p.email && <p className="text-xs text-gray-500 truncate">{p.email}</p>}
                          </div>
                        </button>
                      ))}
                    </section>
                  )}
                  {results.records.length > 0 && (
                    <section className="px-3 py-1">
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-1">
                        <FaFileMedical className="w-3.5 h-3.5" /> {t('nav.records') || 'Records'}
                      </h3>
                      {results.records.slice(0, 5).map((r) => (
                        <button
                          key={r._id}
                          type="button"
                          onClick={() => handleSelect(r, 'records')}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50"
                        >
                          <p className="text-sm font-medium text-gray-900 truncate">{r.title}</p>
                          {r.description && <p className="text-xs text-gray-500 line-clamp-1">{r.description}</p>}
                        </button>
                      ))}
                    </section>
                  )}
                  {results.appointments.length > 0 && (
                    <section className="px-3 py-1">
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-1">
                        <FaCalendarAlt className="w-3.5 h-3.5" /> {t('nav.appointments') || 'Appointments'}
                      </h3>
                      {results.appointments.slice(0, 5).map((a) => (
                        <button
                          key={a._id}
                          type="button"
                          onClick={() => handleSelect(a, 'appointments')}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50"
                        >
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {a.docName || a.userData?.name || 'Appointment'}
                          </p>
                          <p className="text-xs text-gray-500">{a.slotDate} {a.slotTime}</p>
                        </button>
                      ))}
                    </section>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
